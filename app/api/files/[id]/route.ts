import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";

// Helper function to check permission
async function checkPermission(fileId: string, userId: string): Promise<{ allowed: boolean; file?: any }> {
  const user = await prisma.dir_User.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) return { allowed: false };

  // If Admin, can access any file
  // If User, must own the file
  const whereClause = user.role === 'ADMIN'
    ? { id: fileId }
    : { id: fileId, userId: userId };

  const file = await prisma.fileNode.findFirst({
    where: whereClause,
  });

  console.log(file);

  return { allowed: !!file, file };
}

// Update file status (Soft delete, Recommend, Rename, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { recommendStatus, deleteStatus } = body;

    // Check Permission
    const { allowed, file: existingFile } = await checkPermission(id, userId);

    if (!allowed) {
      return NextResponse.json(
        { message: "คุณไม่ได้รับอนุญาตให้แก้ไขไฟล์นี้" },
        { status: 401 }
      );
    } else if (!existingFile) {
      return NextResponse.json(
        { message: "ไม่พบไฟล์" },
        { status: 404 }
      );
    }

    // Update data preparation
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
      if (deleteStatus === true) {
        updateData.deletedAt = new Date();
      } else {
        updateData.deletedAt = null;
      }
    }

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

// Delete file permanently
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check Permission
    const { allowed, file: existingFile } = await checkPermission(id, userId);

    if (!allowed || !existingFile) {
      return NextResponse.json(
        { message: "File not found or unauthorized to delete" },
        { status: 403 }
      );
    }

    // Delete the file
    // Note: If it's a folder, this might fail if it has children and no cascade delete is set in DB.
    // For now, simple delete.

    // Try to delete physical file if it exists
    if (existingFile.type === 'FILE' && existingFile.storageKey) {
      try {
        const filePath = path.join(process.cwd(), "uploads", existingFile.storageKey);
        await unlink(filePath);
      } catch (err) {
        console.error("Error deleting physical file:", err);
        // Continue to delete from DB even if physical file is missing or delete fails
      }
    }

    await prisma.fileNode.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "File deleted permanently" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { message: "Error deleting file", error },
      { status: 500 }
    );
  }
}
