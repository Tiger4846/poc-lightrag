import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";
import { createFolderSchema } from "@/lib/zod/schema";

// api สร้างโฟลเดอร์ใหม่

export async function POST(req: Request) {
    try {

        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json(
                { message: "กรุณาเข้าสู่ระบบก่อนทำการสร้างโฟลเดอร์" }, 
                { status: 401 }
            );
        }


        const user = await prisma.dir_User.findUnique({ 
            where: { id: userId },
            select: { id: true }
        });
        
        if (!user) {
            return NextResponse.json(
                { message: "ไม่พบข้อมูลผู้ใช้" }, 
                { status: 404 }
            );
        }


        const data = await req.json();
        console.log("Received folder data:", data);
        
        const safedata = createFolderSchema.parse(data);
        const { name, parentId } = safedata;

        const newfolder = await prisma.fileNode.create({
            data: {
                name: name.trim(),
                type: "FOLDER",
                parentId: parentId || null,
                userId: userId,
            }
        });

        return NextResponse.json({
            message: "สร้างโฟลเดอร์สำเร็จ", 
            folder: newfolder
        }, { status: 200 });
    }
    catch (error) {
        console.error("Error creating folder:", error);
        return NextResponse.json({
            message: "เกิดข้อผิดพลาดในการสร้างโฟลเดอร์",
            error
        }, { status: 500 });
    }
}
