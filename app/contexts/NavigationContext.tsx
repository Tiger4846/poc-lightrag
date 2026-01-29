"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Swal from "sweetalert2";
import { FileItem } from "../types/file";
import { buildFileTree, findFileById } from "@/lib/utils/fileMapper";
import { fileService } from "@/lib/services/file.service";

interface NavigationContextType {
  files: FileItem[];
  currentPath: string[];
  currentFolderId: string | null;
  navigateToFolder: (folderName: string) => void;
  navigateToPath: (path: string[]) => void;
  navigateToFolderId: (folderId: string | null) => boolean;
  refreshFiles: () => Promise<void>;
  getCurrentItems: () => FileItem[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  // ฟังก์ชันดึงข้อมูลไฟล์จาก API
  const refreshFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'กรุณาเข้าสู่ระบบ',
          text: 'คุณต้องเข้าสู่ระบบก่อนเข้าถึงหน้านี้',
        });
        window.location.href = '/login';
        return;
      }

      const data = await fileService.getAllFiles();
      const fileTree = buildFileTree(data.files);
      setFiles(fileTree);
    } catch (error: unknown) {
      console.error('Error fetching files:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error.response as { data?: { message?: string } })?.data?.message
        : 'ไม่สามารถโหลดข้อมูลไฟล์ได้';

      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
      });
      throw error;
    }
  };

  // โหลดข้อมูลครั้งแรกเมื่อ component mount
  useEffect(() => {
    const loadInitialData = async () => {
      await refreshFiles();
    };
    loadInitialData();
  }, []);

  // ฟังก์ชันนำทางเข้าโฟลเดอร์
  const navigateToFolder = (folderName: string) => {
    setCurrentPath([...currentPath, folderName]);
  };

  // ฟังก์ชันนำทางไปยัง path ที่กำหนด
  const navigateToPath = (path: string[]) => {
    setCurrentPath(path);
  };

  // ฟังก์ชันนำทางด้วย folder ID
  const navigateToFolderId = (folderId: string | null): boolean => {
    // ถ้าเป็น null หรือ empty string = กลับไป root
    if (!folderId) {
      setCurrentPath([]);
      return true;
    }

    // ค้นหา folder ด้วย ID
    const result = findFileById(files, folderId);

    if (!result) {
      // ไม่เจอ folder
      Swal.fire({
        icon: 'error',
        title: 'ไม่พบโฟลเดอร์',
        text: 'โฟลเดอร์ที่คุณต้องการเข้าถึงไม่มีอยู่ในระบบ',
      });
      setCurrentPath([]);
      return false;
    }

    // ตรวจสอบว่าถูกลบหรือไม่
    if (result.item.delete_status) {
      Swal.fire({
        icon: 'warning',
        title: 'โฟลเดอร์ถูกลบแล้ว',
        text: 'โฟลเดอร์นี้ถูกย้ายไปถังขยะแล้ว',
      });
      setCurrentPath([]);
      return false;
    }

    // ตรวจสอบว่าเป็น folder จริงหรือไม่
    if (result.item.type !== 'folder') {
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถเปิดได้',
        text: 'รายการนี้ไม่ใช่โฟลเดอร์',
      });
      setCurrentPath([]);
      return false;
    }

    // ตั้งค่า path (ไม่รวมชื่อ folder ตัวเอง)
    const pathToFolder = result.path.slice(0, -1);
    setCurrentPath(pathToFolder);

    // แล้วค่อย navigate เข้าไปใน folder
    setCurrentPath(result.path);
    return true;
  };

  // ฟังก์ชันหา current folder ID
  const getCurrentFolderId = (): string | null => {
    if (currentPath.length === 0) return null;

    let items = files;
    let currentFolder: FileItem | null = null;

    for (const folderName of currentPath) {
      const folder = items.find(item => item.name === folderName && item.type === "folder");
      if (folder && folder.id) {
        currentFolder = folder;
        items = folder.children || [];
      }
    }

    return currentFolder?.id || null;
  };

  // ฟังก์ชันดึงรายการไฟล์ในระดับปัจจุบัน
  const getCurrentItems = (): FileItem[] => {
    let items = files;
    for (const folderName of currentPath) {
      const folder = items.find(item => item.name === folderName);
      if (folder && folder.children) {
        items = folder.children;
      }
    }
    return items.filter(item => !item.delete_status);
  };

  const value: NavigationContextType = {
    files,
    currentPath,
    currentFolderId: getCurrentFolderId(),
    navigateToFolder,
    navigateToPath,
    navigateToFolderId,
    refreshFiles,
    getCurrentItems,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

// Hook สำหรับใช้ context
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
