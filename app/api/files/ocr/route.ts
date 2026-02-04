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

        // Get all files that haven't been OCR'd successfully yet (UNPROCESSED or FAILED)
        const files = await prisma.fileNode.findMany({
            where: {
                type: "FILE",
                ocrStatus: {
                    in: ["UNPROCESSED", "FAILED"]
                },
                deleteStatus: false,
            },
        });

        const results: { id: string; name: string; status: string; message?: string }[] = [];
        const { ocrQueue } = require("@/lib/queue");

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

                results.push({ id: file.id, name: file.name, status: "queued", message: "Added to OCR queue" });
            } catch (error: any) {
                results.push({ id: file.id, name: file.name, status: "error", message: error.message });
                try {
                    await prisma.fileNode.update({
                        where: { id: file.id },
                        data: { ocrStatus: 'FAILED' }
                    });
                } catch (e) { }
            }
        }

        return NextResponse.json({
            message: "Bulk OCR process initiated",
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
            where: { type: "FILE", ocrStatus: "SUCCESS", deleteStatus: false },
        });

        // Pending includes UNPROCESSED and FAILED (can be retried)
        const ocrPending = await prisma.fileNode.count({
            where: {
                type: "FILE",
                ocrStatus: {
                    in: ["UNPROCESSED", "FAILED", "PENDING"]
                },
                deleteStatus: false
            },
        });

        // Breakdown for better detail if needed, but keeping interface compact
        const ocrProcessing = await prisma.fileNode.count({
            where: { type: "FILE", ocrStatus: "PENDING", deleteStatus: false },
        });

        const ocrUnprocessed = await prisma.fileNode.count({
            where: { type: "FILE", ocrStatus: "UNPROCESSED", deleteStatus: false },
        });

        const ocrFailed = await prisma.fileNode.count({
            where: { type: "FILE", ocrStatus: "FAILED", deleteStatus: false },
        });

        return NextResponse.json({
            totalFiles,
            ocrCompleted,
            ocrPending, // This matches the UI 'ocrPending' expectation (files not yet done)
            ocrProcessing,
            ocrUnprocessed,
            ocrFailed
        }, { status: 200 });

    } catch (error) {
        console.error("OCR status error:", error);
        return NextResponse.json(
            { message: "Error getting OCR status" },
            { status: 500 }
        );
    }
}
