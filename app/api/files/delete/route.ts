import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";

// api เรียกดูไฟล์ที่ถูกลบ
export async function GET(req: Request) {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
        return NextResponse.json(
            { message: "Unauthorized - Please login first" },
            { status: 401 }
        );
    }
    try {
        const filesdelete = await prisma.fileNode.findMany({
            where: {
                userId: userId,
                deleteStatus: true,
            },
            orderBy: {
                deletedAt: "desc",
            },
        });
        return NextResponse.json({ filesdelete }, { status: 200 });

    } catch (error) {
        console.error("Error fetching deleted files:", error);
        return NextResponse.json(
            { message: "Error fetching deleted files", error },
            { status: 500 }
        );
    }
}

// Hard delete files (API Key required)
export async function POST(req: Request) {
    const apiKey = req.headers.get("x-api-key");
    const validApiKey = process.env.UPLOAD_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
        return NextResponse.json(
            { message: "Unauthorized - Invalid API Key" },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { message: "Invalid request - 'ids' must be a non-empty array" },
                { status: 400 }
            );
        }

        const results = [];

        for (const id of ids) {
            try {
                const file = await prisma.fileNode.findUnique({
                    where: { id: id },
                });

                if (!file) {
                    results.push({ id, status: "not_found" });
                    continue;
                }

                // Delete physical file if exists
                if (file.type === 'FILE' && file.storageKey) {
                    try {
                        const filePath = path.join(process.cwd(), "uploads", file.storageKey);
                        await unlink(filePath);
                    } catch (err: any) {
                        console.error(`Error deleting physical file ${id}:`, err);
                        // Start of Selection
                        if (err.code !== 'ENOENT') {
                            results.push({ id, status: "failed", error: "Failed to delete physical file" });
                            // deciding whether to continue with DB delete? 
                            // Usually if physical delete fails, we might want to keep DB record or force delete.
                            // Let's assume we proceed to try DB delete or mark partial failure.
                            // But for consistency with [id] route, we often ignore ENOENT.
                        }
                    }
                }

                await prisma.fileNode.delete({
                    where: { id: id },
                });

                results.push({ id, status: "deleted" });

            } catch (error: any) {
                console.error(`Error deleting file ${id}:`, error);
                results.push({ id, status: "failed", error: error.message });
            }
        }

        return NextResponse.json({ message: "Operation completed", results }, { status: 200 });

    } catch (error) {
        console.error("Error processing delete request:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error },
            { status: 500 }
        );
    }
}

