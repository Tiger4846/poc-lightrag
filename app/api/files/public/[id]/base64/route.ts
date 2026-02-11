import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import path from "path";
import fs from "fs";

const MIME_TYPES: Record<string, string> = {
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'txt': 'text/plain',
    'md': 'text/markdown',
    'markdown': 'text/markdown',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return MIME_TYPES[ext] || 'application/octet-stream';
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: slug } = await params;
        const decodedSlug = decodeURIComponent(slug);

        // Check if slug is a valid UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(decodedSlug);

        let file;
        if (isUUID) {
            file = await prisma.fileNode.findUnique({
                where: { id: decodedSlug },
                select: {
                    id: true,
                    name: true,
                    storageKey: true,
                    type: true
                }
            });
        } else {
            // Search by name (take the latest one)
            file = await prisma.fileNode.findFirst({
                where: {
                    name: decodedSlug,
                    type: 'FILE'
                },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    storageKey: true,
                    type: true
                }
            });
        }

        if (!file || !file.storageKey) {
            return NextResponse.json({ message: "File not found" }, { status: 404 });
        }

        const filePath = path.join(process.cwd(), "uploads", file.storageKey);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ message: "File content not found on disk" }, { status: 404 });
        }

        // Read file and convert to base64
        const fileBuffer = fs.readFileSync(filePath);
        const base64Content = fileBuffer.toString('base64');
        const mimeType = getMimeType(file.name);

        return NextResponse.json({
            id: file.id,
            name: file.name,
            mimeType: mimeType,
            base64: base64Content,
            // Prefix common for UI usage: data:image/png;base64,...
            dataUrl: `data:${mimeType};base64,${base64Content}`
        });

    } catch (error: any) {
        console.error("Base64 API error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
