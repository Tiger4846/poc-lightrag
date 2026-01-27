import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {v4 as uuidv4} from "uuid";
import {prisma} from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";

export async function POST(req:Request) {
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
            if(!file){
                return NextResponse.json({message:"No file provided"}, {status:400});
            }

        const parentId = data.get("parentId") as string | null;
    
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
            
        const uploadDir = path.join(process.cwd(),"uploads");
        await mkdir(uploadDir,{recursive:true});

        const fileExtension = path.extname(file.name) || "";
        const uniqueFileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(uploadDir,uniqueFileName);
        await writeFile(filePath,buffer);
        await prisma.fileNode.create({
                data: {
                    name: file.name,
                    type: "FILE",
                    storageKey: uniqueFileName,
                    size: file.size,
                    // mimeType: file.type,
                    parentId: parentId || null,
                    userId: userId, // เชื่อมโยงไฟล์กับผู้ใช้ที่อัปโหลด
                },
            });

        return NextResponse.json({message:"File uploaded successfully", fileName: uniqueFileName}, {status:200});
        } catch (error) {  
            return NextResponse.json({message:"Error uploading file",error}, {status:500});
        }
}