import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";
import path from "path";
import fs from "fs";
import { readFile } from "fs/promises";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const fileNode = await prisma.fileNode.findUnique({
            where: { id },
        });

        if (!fileNode || fileNode.type !== 'FILE') {
            return NextResponse.json({ message: "File not found" }, { status: 404 });
        }

        // Permission check
        // If admin, okay. If user, must match userId.
        const userRole = await prisma.dir_User.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (userRole?.role !== 'ADMIN' && fileNode.userId !== userId) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const filePath = path.join(process.cwd(), "uploads", fileNode.storageKey || "");

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ message: "File content not found" }, { status: 404 });
        }

        const fileBuffer = await readFile(filePath);

        // Determine Mime Type
        const ext = path.extname(fileNode.name).toLowerCase();
        const mimeMap: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.md': 'text/markdown',
            '.markdown': 'text/markdown',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            // Add more as needed
        };
        const contentType = mimeMap[ext] || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `inline; filename="${encodeURIComponent(fileNode.name)}"`,
            },
        });

    } catch (error) {
        console.error("View file error:", error);
        return NextResponse.json({ message: "Internal Error" }, { status: 500 });
    }
}
