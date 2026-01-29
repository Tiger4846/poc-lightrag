import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";

// api เรียกดูไฟล์ที่ถูกลบ
export async function GET(req:Request) {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
        return NextResponse.json(
            { message: "Unauthorized - Please login first" }, 
            { status: 401 }
        );
    }
    try{
        const filesdelete = await prisma.fileNode.findMany({
            where: {
                userId: userId,
                deleteStatus: true,
            },
            orderBy: {
                deletedAt: "desc",
            },
        });
        return NextResponse.json({filesdelete}, {status:200});

    } catch (error) {
        console.error("Error fetching deleted files:", error);
        return NextResponse.json(
            { message: "Error fetching deleted files", error }, 
            { status: 500 }
        );
    }
}

