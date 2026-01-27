import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { unlink } from "fs/promises";
import path from "path";


// api ลบไฟล์ที่ถูกลบถาวรเกิน 30 วัน
export async function DELETE(req: Request) {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const filestoDelete = await prisma.fileNode.findMany({
            where:{
                deleteStatus: true,
                deletedAt: {
                    lte: thirtyDaysAgo,
                },
            }
        })
        
        const uploaddir = path.join(process.cwd(), 'uploads');
        for (const file of filestoDelete) {
            if (file.storageKey) {
                try {
                    const filePath = path.join(uploaddir, file.storageKey);
                    await unlink(filePath);
                } catch (error) {
                    console.error(`Error deleting error`, error);
                }
            }
        }

        await prisma.fileNode.deleteMany({
            where : {
                id: {
                    in: filestoDelete.map(file => file.id)
                }
            }
        });

        return NextResponse.json(
            { message: "Cleaned up deleted files successfully", deletedCount: filestoDelete.length },
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { message: "Error cleaning deleted files", error },
            { status: 500 }
        );
    }
}