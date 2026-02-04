import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { createWriteStream } from "fs";

// api อัพโหลดไฟล์
export async function POST(req: Request) {
    try {
        // ตรวจสอบ authentication
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized - Please login first" },
                { status: 401 }
            );
        }


        const data = await req.formData();
        const file: File | null = data.get("file") as unknown as File;
        if (!file) {
            return NextResponse.json({ message: "No file provided" }, { status: 400 });
        }



        const parentId = data.get("parentId") as string | null;
        // สร้างโฟลเดอร์สำหรับเก็บไฟล์ ถ้ายังไม่มี
        const uploadDir = path.join(process.cwd(), "uploads");
        await mkdir(uploadDir, { recursive: true });

        // สร้างชื่อไฟล์แบบสุ่มเพื่อป้องกันการชนกัน
        // Create unique filename based on original name
        // Check if file exists, if so append timestamp
        const fs = require('fs');
        let uniqueFileName = file.name;
        let filePath = path.join(uploadDir, uniqueFileName);

        if (fs.existsSync(filePath)) {
            const nameWithoutExt = path.parse(file.name).name;
            const ext = path.parse(file.name).ext;
            const timestamp = Date.now();
            uniqueFileName = `${nameWithoutExt}_${timestamp}${ext}`;
            filePath = path.join(uploadDir, uniqueFileName);
        }

        // บันทึกไฟล์ลงระบบไฟล์ด้วย streams
        const fileWriter = createWriteStream(filePath);
        const fileStream = Readable.fromWeb(file.stream() as any);
        await pipeline(fileStream, fileWriter);

        // บันทึกข้อมูลไฟล์ลงฐานข้อมูล

        const newFile = await prisma.fileNode.create({
            data: {
                name: file.name,
                type: "FILE",
                storageKey: uniqueFileName,
                size: file.size,
                // mimeType: file.type,
                parentId: parentId || null,
                userId: userId,
            },
        });

        // Add to OCR Queue automatically
        // Auto-queue disabled
        /*
        try {
            const { ocrQueue } = require("@/lib/queue");
            // ...
        } catch (queueError) {
            // ...
        }
        */

        return NextResponse.json({ message: "File uploaded successfully", fileName: uniqueFileName, fileId: newFile.id }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error uploading file", error }, { status: 500 });
    }
}