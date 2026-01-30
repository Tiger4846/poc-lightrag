-- CreateEnum
CREATE TYPE "dir_role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "dir_User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "dir_role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "dir_User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileNode" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    "size" INTEGER,
    "storageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "recommendStatus" BOOLEAN NOT NULL DEFAULT false,
    "deleteStatus" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FileNode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dir_User_email_key" ON "dir_User"("email");

-- AddForeignKey
ALTER TABLE "FileNode" ADD CONSTRAINT "FileNode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "dir_User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileNode" ADD CONSTRAINT "FileNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FileNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
