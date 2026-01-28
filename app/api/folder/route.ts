import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";

// api สร้างโฟลเดอร์ใหม่

export async function POST(req: Request) {
    try {
        // ตรวจสอบ authentication
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json(
                { message: "กรุณาเข้าสู่ระบบก่อนทำการสร้างโฟลเดอร์" }, 
                { status: 401 }
            );
        }

        // ดึงข้อมูล user เพื่อตรวจสอบ role
        const user = await prisma.dir_User.findUnique({ 
            where: { id: userId },
            select: { id: true, role: true }
        });
        
        if (!user) {
            return NextResponse.json(
                { message: "ไม่พบข้อมูลผู้ใช้" }, 
                { status: 404 }
            );
        }

        // ตรวจสอบสิทธิ์ - เฉพาะ ADMIN เท่านั้นที่สร้างโฟลเดอร์ได้ (MVP)
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { message: "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถสร้างโฟลเดอร์ได้" },
                { status: 403 }
            );
        }

        const data = await req.json();
        console.log("Received folder data:", data);
        const { name, parentId } = data;

        // ตรวจสอบว่ามีชื่อโฟลเดอร์หรือไม่
        if (!name || name.trim() === '') {
            return NextResponse.json(
                { message: "กรุณาระบุชื่อโฟลเดอร์" },
                { status: 400 }
            );
        }

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