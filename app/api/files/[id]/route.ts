import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";


//api อัพเดทสถานะไฟล์
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบ authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { recommendStatus, deleteStatus } = body;

    // ตรวจสอบว่าไฟล์เป็นของผู้ใช้หรือไม่
    const existingFile = await prisma.fileNode.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!existingFile) {
      return NextResponse.json(
        { message: "File not found or unauthorized" },
        { status: 404 }
      );
    }

    // เตรียมข้อมูลสำหรับอัพเดท
    const updateData: {
      recommendStatus?: boolean;
      deleteStatus?: boolean;
      deletedAt?: Date | null;
    } = {};

    if (typeof recommendStatus === "boolean") {
      updateData.recommendStatus = recommendStatus;
    }

    if (typeof deleteStatus === "boolean") {
      updateData.deleteStatus = deleteStatus;
      // ถ้าลบ ให้ตั้ง deletedAt
      if (deleteStatus === true) {
        updateData.deletedAt = new Date();
      } else {
        // ถ้ายกเลิกการลบ ให้เคลียร์ deletedAt
        updateData.deletedAt = null;
      }
    }

    // อัพเดทไฟล์
    const updatedFile = await prisma.fileNode.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json(
      {
        message: "File updated successfully",
        file: updatedFile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { message: "Error updating file", error },
      { status: 500 }
    );
  }
}
