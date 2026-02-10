import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";
import path from "path";
import fs from "fs";
import { writeFile, mkdir } from "fs/promises";

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || "http://localhost:8001";

// Function to save OCR result as .md file
async function saveOcrResultAsMd(fileId: string, fileName: string, ocrText: string): Promise<string> {
    const markdownDir = path.join(process.cwd(), "markdown");

    // Create markdown directory if it doesn't exist
    if (!fs.existsSync(markdownDir)) {
        await mkdir(markdownDir, { recursive: true });
    }

    const safeName = path.parse(fileName).name.replace(/[^a-z0-9\u0E00-\u0E7F]/gi, '_');
    const mdFileName = `${safeName}-${fileId}.md`;
    const mdFilePath = path.join(markdownDir, mdFileName);
    const relativePath = `markdown/${mdFileName}`;

    // Save only the raw extracted text
    await writeFile(mdFilePath, ocrText, 'utf-8');
    return relativePath;
}

// Function to get OCR result from .md file
async function getOcrResultFromMd(markdownPath: string): Promise<string | null> {
    const mdFilePath = path.join(process.cwd(), markdownPath);

    if (!fs.existsSync(mdFilePath)) {
        return null;
    }

    const content = fs.readFileSync(mdFilePath, 'utf-8');
    return content;
}

// Function to check OCR service health
async function checkOcrServiceHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${OCR_SERVICE_URL}/health`, {
            method: 'GET',
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Function to perform OCR using FastAPI service
async function performOCR(filePath: string, fileName: string): Promise<string> {
    // Check OCR service health first
    const isHealthy = await checkOcrServiceHealth();
    if (!isHealthy) {
        throw new Error('OCR service is not available. Please make sure the OCR service is running.');
    }

    // Read file and create form data
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer]);

    const formData = new FormData();
    formData.append('file', blob, fileName);

    // 10 minute timeout for large files
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000);

    try {
        const response = await fetch(`${OCR_SERVICE_URL}/ocr`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'OCR service error');
        }

        const data = await response.json();
        return data.markdown || '';
    } catch (error: any) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// OCR single file
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized - Please login first" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Get the file
        const file = await prisma.fileNode.findUnique({
            where: { id },
        });

        if (!file) {
            return NextResponse.json(
                { message: "File not found" },
                { status: 404 }
            );
        }

        if (file.type !== "FILE") {
            return NextResponse.json(
                { message: "Cannot OCR a folder" },
                { status: 400 }
            );
        }

        if (!file.storageKey) {
            return NextResponse.json(
                { message: "File has no storage key" },
                { status: 400 }
            );
        }

        const filePath = path.join(process.cwd(), "uploads", file.storageKey);

        // Check if file is an image or PDF
        const ext = path.extname(file.name).toLowerCase();
        const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];

        if (!supportedFormats.includes(ext)) {
            return NextResponse.json(
                { message: "Unsupported file format for OCR" },
                { status: 400 }
            );
        }

        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { message: "File content not found on disk" },
                { status: 404 }
            );
        }

        // Add to OCR Queue instead of processing synchronously
        try {
            const { ocrQueue } = require("@/lib/queue"); // Dynamic import

            // Set status to PENDING immediately
            await prisma.fileNode.update({
                where: { id: file.id },
                data: { ocrStatus: 'PENDING' }
            });

            await ocrQueue.add("ocr-job", {
                fileId: file.id,
                filePath: filePath,
                fileName: file.name
            });
            console.log(`Added manual OCR job for file: ${file.name}`);
        } catch (queueError) {
            console.error("Failed to add to OCR queue:", queueError);
            return NextResponse.json(
                { message: "Failed to queue OCR job", error: String(queueError) },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "OCR job queued successfully",
            fileId: file.id,
            status: "queued"
        }, { status: 200 });

    } catch (error: any) {
        console.error("OCR error:", error);
        return NextResponse.json(
            { message: "Error queuing OCR job", error: error.message },
            { status: 500 }
        );
    }
}

// Get OCR result for a single file
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Get the file
        const file = await prisma.fileNode.findUnique({
            where: { id },
        });

        if (!file) {
            return NextResponse.json(
                { message: "File not found" },
                { status: 404 }
            );
        }

        if (file.ocrStatus !== 'SUCCESS') {
            return NextResponse.json(
                { message: "OCR not yet performed for this file" },
                { status: 404 }
            );
        }

        // Determine markdown path - use stored path or construct expected path
        let markdownPath = file.markdownPath;

        // If markdownPath is missing but ocrStatus is true, try to find the file using expected path
        if (!markdownPath) {
            const expectedPath = `markdown/${id}.md`;
            const fullPath = path.join(process.cwd(), expectedPath);

            if (fs.existsSync(fullPath)) {
                // File exists, update the database with the correct path
                markdownPath = expectedPath;
                await prisma.fileNode.update({
                    where: { id },
                    data: { markdownPath: expectedPath },
                });
            } else {
                return NextResponse.json(
                    { message: "OCR result file not found. Please re-run OCR." },
                    { status: 404 }
                );
            }
        }

        // Get OCR result from .md file
        const ocrContent = await getOcrResultFromMd(markdownPath);

        if (!ocrContent) {
            return NextResponse.json(
                { message: "OCR result file not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            fileId: file.id,
            fileName: file.name,
            markdownPath: markdownPath,
            ocrContent,
        }, { status: 200 });

    } catch (error) {
        console.error("Get OCR error:", error);
        return NextResponse.json(
            { message: "Error getting OCR result" },
            { status: 500 }
        );
    }
}

// Update OCR result for a single file
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await req.json();
        const { content } = body;

        if (typeof content !== 'string') {
            return NextResponse.json(
                { message: "Content must be a string" },
                { status: 400 }
            );
        }

        // Get the file
        const file = await prisma.fileNode.findUnique({
            where: { id },
        });

        if (!file) {
            return NextResponse.json(
                { message: "File not found" },
                { status: 404 }
            );
        }

        if (file.ocrStatus !== 'SUCCESS') {
            return NextResponse.json(
                { message: "OCR not yet performed for this file" },
                { status: 404 }
            );
        }

        // Determine markdown path
        let markdownPath = file.markdownPath;

        if (!markdownPath) {
            return NextResponse.json(
                { message: "Markdown path not found for this file" },
                { status: 404 }
            );
        }

        const mdFilePath = path.join(process.cwd(), markdownPath);

        // Ensure directory exists
        if (!fs.existsSync(path.dirname(mdFilePath))) {
            await mkdir(path.dirname(mdFilePath), { recursive: true });
        }

        // Write content to file
        await writeFile(mdFilePath, content, 'utf-8');

        return NextResponse.json({
            message: "OCR result updated successfully",
            fileId: file.id,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Update OCR error:", error);
        return NextResponse.json(
            { message: "Error updating OCR result", error: error.message },
            { status: 500 }
        );
    }
}
