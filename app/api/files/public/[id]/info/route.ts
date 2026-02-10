import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";

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
                    type: true,
                    size: true,
                    createdAt: true
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
                    type: true,
                    size: true,
                    createdAt: true
                }
            });
        }

        if (!file) {
            return NextResponse.json({ message: "File not found" }, { status: 404 });
        }

        return NextResponse.json(file);

    } catch (error: any) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
