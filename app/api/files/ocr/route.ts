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

    const mdFileName = `${fileId}.md`;
    const mdFilePath = path.join(markdownDir, mdFileName);
    const relativePath = `markdown/${mdFileName}`;

    // Save only the raw extracted text
    await writeFile(mdFilePath, ocrText, 'utf-8');
    return relativePath;
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

// OCR all files endpoint
export async function POST(req: Request) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized - Please login first" },
                { status: 401 }
            );
        }

        // Check if user is admin
        const user = await prisma.dir_User.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (user?.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Only admin can perform bulk OCR" },
                { status: 403 }
            );
        }

        // Get all files that haven't been OCR'd yet
        const files = await prisma.fileNode.findMany({
            where: {
                type: "FILE",
                ocrStatus: false,
                deleteStatus: false,
            },
        });

        const results: { id: string; name: string; status: string; message?: string; markdownPath?: string }[] = [];

        for (const file of files) {
            if (!file.storageKey) {
                results.push({ id: file.id, name: file.name, status: "skipped", message: "No storage key" });
                continue;
            }

            const filePath = path.join(process.cwd(), "uploads", file.storageKey);

            // Check if file is an image or PDF
            const ext = path.extname(file.name).toLowerCase();
            const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];

            if (!supportedFormats.includes(ext)) {
                results.push({ id: file.id, name: file.name, status: "skipped", message: "Unsupported format" });
                continue;
            }

            if (!fs.existsSync(filePath)) {
                results.push({ id: file.id, name: file.name, status: "error", message: "File not found" });
                continue;
            }

            try {
                const ocrText = await performOCR(filePath, file.name);

                // Save OCR result as .md file
                const markdownPath = await saveOcrResultAsMd(file.id, file.name, ocrText);

                // Update file with OCR status and markdown path
                await prisma.fileNode.update({
                    where: { id: file.id },
                    data: {
                        ocrStatus: true,
                        markdownPath: markdownPath,
                    },
                });

                results.push({ id: file.id, name: file.name, status: "success", message: "OCR completed", markdownPath });
            } catch (error: any) {
                results.push({ id: file.id, name: file.name, status: "error", message: error.message });
            }
        }

        return NextResponse.json({
            message: "OCR process completed",
            total: files.length,
            results,
        }, { status: 200 });

    } catch (error) {
        console.error("OCR error:", error);
        return NextResponse.json(
            { message: "Error performing OCR", error },
            { status: 500 }
        );
    }
}

// Get OCR status endpoint
export async function GET(req: Request) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Count files by OCR status
        const totalFiles = await prisma.fileNode.count({
            where: { type: "FILE", deleteStatus: false },
        });

        const ocrCompleted = await prisma.fileNode.count({
            where: { type: "FILE", ocrStatus: true, deleteStatus: false },
        });

        const ocrPending = await prisma.fileNode.count({
            where: { type: "FILE", ocrStatus: false, deleteStatus: false },
        });

        return NextResponse.json({
            totalFiles,
            ocrCompleted,
            ocrPending,
        }, { status: 200 });

    } catch (error) {
        console.error("OCR status error:", error);
        return NextResponse.json(
            { message: "Error getting OCR status" },
            { status: 500 }
        );
    }
}
