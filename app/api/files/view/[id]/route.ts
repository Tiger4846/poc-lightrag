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
            // If not a UUID, search by name (take the latest one)
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

        if (!file || file.type !== 'FILE' || !file.storageKey) {
            return new NextResponse("File not found", { status: 404 });
        }

        const filePath = path.join(process.cwd(), "uploads", file.storageKey);

        if (!fs.existsSync(filePath)) {
            return new NextResponse("File content not found on disk", { status: 404 });
        }

        // Get file stats
        const stats = fs.statSync(filePath);
        const fileBuffer = fs.readFileSync(filePath);

        // Determine content type
        const contentType = getMimeType(file.name);

        // Return the file with correct headers
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Length": stats.size.toString(),
                "Content-Disposition": `inline; filename="${encodeURIComponent(file.name)}"`,
                "Cache-Control": "public, max-age=3600"
            }
        });

    } catch (error: any) {
        console.error("Public file view API error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
