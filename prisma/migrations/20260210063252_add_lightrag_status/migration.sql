-- AlterTable
ALTER TABLE "FileNode" ADD COLUMN     "lightragDocId" TEXT,
ADD COLUMN     "lightragStatus" TEXT NOT NULL DEFAULT 'NONE';
