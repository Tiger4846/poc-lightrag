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
        // ตรวจสอบ authentication (Support API Key)
        const apiKey = req.headers.get("x-api-key");
        const validApiKey = process.env.UPLOAD_API_KEY;
        let userId: string | null = null;

        if (apiKey && validApiKey && apiKey === validApiKey) {
            // กรณีใช้ API Key ให้ userId เป็น null (upload โดย service ภายนอก)
            userId = null;
        } else {
            // กรณีปกติใช้ JWT
            userId = getUserIdFromRequest(req);
            if (!userId) {
                return NextResponse.json(
                    { message: "Unauthorized - Please login first" },
                    { status: 401 }
                );
            }
        }


        const data = await req.formData();
        console.log("data --->", data);
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
        // Decode filename to handle URL encoded names
        const originalName = decodeURIComponent(file.name);

        let uniqueFileName = originalName;
        let filePath = path.join(uploadDir, uniqueFileName);

        if (fs.existsSync(filePath)) {
            const nameWithoutExt = path.parse(originalName).name;
            const ext = path.parse(originalName).ext;
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
                name: originalName,
                type: "FILE",
                storageKey: uniqueFileName,
                size: file.size,
                // mimeType: file.type,
                parentId: parentId || null,
                userId: userId,
            },
        });

        return NextResponse.json({
            message: "File uploaded successfully",
            fileName: uniqueFileName,
            id: newFile.id
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error uploading file", error }, { status: 500 });
    }
}