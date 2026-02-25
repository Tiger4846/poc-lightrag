import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";
import path from "path";
import fs from "fs";
import FormData from "form-data";
import api from "@/lib/axios";

const LIGHTRAG_API_KEY = process.env.LIGHTRAG_API_KEY;
// Hardcoded based on request
// Hardcoded based on request
const LIGHTRAG_API_BASE = process.env.LIGHTRAG_API_URL || "http://localhost:9621";
const LIGHTRAG_UPLOAD_URL = LIGHTRAG_API_BASE.endsWith('/documents/upload')
    ? LIGHTRAG_API_BASE
    : `${LIGHTRAG_API_BASE.replace(/\/$/, '')}/documents/upload`;

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
                { message: "Cannot upload a folder to LightRAG" },
                { status: 400 }
            );
        }

        if (!file.storageKey) {
            return NextResponse.json(
                { message: "File has no storage key" },
                { status: 400 }
            );
        }

        let filePath = path.join(process.cwd(), "uploads", file.storageKey);
        let uploadFileName = file.name || `${file.id}`;

        if (file.ocrStatus === "SUCCESS" && file.markdownPath) {
            filePath = path.join(process.cwd(), file.markdownPath);
            uploadFileName = path.basename(filePath);
        } else if (file.ocrStatus !== "SUCCESS") {
            // If OCR is not success, maybe user uploaded a non-text file that needs OCR?
            // But lightrag API error says unsupported type so probably need OCR first.
            // Let's assume we REQUIRE successful OCR for non-text files or check extension?
            // For now, if user says "send markdown", we try markdown.
            // If original file is supported (e.g. .txt), maybe fine?
            // But let's stick to the request: "send markdown file".
            if (!['.txt', '.md', '.markdown'].includes(path.extname(file.name).toLowerCase())) {
                return NextResponse.json(
                    { message: "File must be processed by OCR first or be a text file." },
                    { status: 400 }
                );
            }
        }

        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { message: "File content not found on disk" },
                { status: 404 }
            );
        }

        // Prepare FormData for LightRAG
        const form = new FormData();
        // Use original filename or fallback to id
        form.append('file', fs.createReadStream(filePath), uploadFileName);

        try {
            const response = await api.post(LIGHTRAG_UPLOAD_URL, form, {
                headers: {
                    ...form.getHeaders(),
                    'X-API-Key': LIGHTRAG_API_KEY,
                    // Add any other required headers if needed
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });

            // Update DB status
            await prisma.fileNode.update({
                where: { id: file.id },
                data: {
                    lightragStatus: 'UPLOADED',
                    lightragDocId: response.data.doc_id || null // Adjust based on actual response structure if needed
                }
            });

            return NextResponse.json({
                message: "Uploaded to LightRAG successfully",
                data: response.data
            }, { status: 200 });

        } catch (error: any) {
            console.error("LightRAG API error:", error?.response?.data || error.message);
            return NextResponse.json(
                {
                    message: "Failed to upload to LightRAG",
                    error: error?.response?.data || error.message
                },
                { status: error?.response?.status || 500 }
            );
        }

    } catch (error: any) {
        console.error("LightRAG route error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
