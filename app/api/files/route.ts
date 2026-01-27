import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";


// api เรียกดูไฟล์ทั้งหมด
export async function GET(req: Request) {
  try {
    // ตรวจสอบ authentication
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    // ดึงไฟล์ทั้งหมดของผู้ใช้พร้อม user relation
    const files = await prisma.fileNode.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { message: "Error fetching files", error },
      { status: 500 }
    );
  }
}
