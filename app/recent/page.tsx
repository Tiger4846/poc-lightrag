"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/files/PageHeader";
import FileCard from "../components/files/FileCard";
import { FileItem } from "../types/file";
import Swal from 'sweetalert2';

export default function RecentPage() {
  const [openMenuIndex, setOpenMenuIndex] = useState<{ section: string, index: number } | null>(null);
  const [Usersname, setUsersname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("userName") || "User";
    }
    return "User";
  });

  const pinnedFiles: FileItem[] = [
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.....", type: "file", fileType: "image", owner: "Waewpan", date: "now", recommend_status: false, delete_status: false, deleted_at: null },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.txt", type: "file", fileType: "txt", owner: "Waewpan", date: "now", recommend_status: false, delete_status: false, deleted_at: null },
  ];

  const recentOpenFiles: FileItem[] = [
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.txt", type: "file", fileType: "txt", owner: "Waewpan", date: "now", recommend_status: false, delete_status: false, deleted_at: null },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.pdf", type: "file", fileType: "pdf", owner: "Waewpan", date: "now", recommend_status: false, delete_status: false, deleted_at: null },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.....", type: "file", fileType: "image", owner: "Waewpan", date: "now", recommend_status: false, delete_status: false, deleted_at: null },
  ];

  const otherFiles: FileItem[] = [
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.txt", type: "file", fileType: "txt", owner: "Waewpan", date: "now", recommend_status: false, delete_status: false, deleted_at: null },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.....", type: "file", fileType: "image", owner: "Waewpan", date: "now", recommend_status: false, delete_status: false, deleted_at: null },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.pdf", type: "file", fileType: "pdf", owner: "Waewpan", date: "now", recommend_status: false, delete_status: false, deleted_at: null },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.txt", type: "file", fileType: "txt", owner: "Waewpan", date: "now", recommend_status: false, delete_status: false, deleted_at: null },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.....", type: "file", fileType: "image", owner: "Waewpan", date: "now", recommend_status: false, delete_status: false, deleted_at: null },
  ];

  const handleMockAction = (action: string, fileName: string) => {
      setOpenMenuIndex(null);
      Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: `ทำรายการ ${action} สำหรับ ${fileName} เรียบร้อย`,
          showConfirmButton: false,
          timer: 1500
      });
  };

  const renderFileSection = (title: string, files: FileItem[], sectionId: string) => (
    <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="flex flex-wrap gap-4">
            {files.map((file, index) => (
                <div key={index} className="w-[280px]">
                    <FileCard 
                        file={file}
                        isMenuOpen={openMenuIndex?.section === sectionId && openMenuIndex?.index === index}
                        onToggleMenu={(e) => {
                            e.stopPropagation();
                            setOpenMenuIndex(
                                openMenuIndex?.section === sectionId && openMenuIndex?.index === index 
                                ? null 
                                : { section: sectionId, index }
                            );
                        }}
                        onCloseMenu={() => setOpenMenuIndex(null)}
                        onNavigate={() => {}}
                        onMoveToTrash={() => handleMockAction('ย้ายไปถังขยะ', file.name)}
                        onToggleRecommend={() => handleMockAction('แนะนำ', file.name)}
                    />
                </div>
            ))}
        </div>
    </section>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <PageHeader name={Usersname} />

        {/* Content */}
        <main className="flex-1 px-8 pt-6 overflow-auto border border-gray-200 rounded-xl mx-4 mb-4 bg-white">
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">ล่าสุด</h1>
            <div className="flex items-center gap-4">
              <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700">
                <option>วันที่ปับ</option>
                <option>เรียง</option>
                <option>ชื่อ</option>
                <option>วันที่</option>
              </select>
            </div>
          </div>

          {renderFileSection("สิ่งที่ปักหมุด", pinnedFiles, "pinned")}
          {renderFileSection("เปิดล่าสุด", recentOpenFiles, "recent")}
          {renderFileSection("อีกแล้ว", otherFiles, "other")}
          
        </main>
      </div>
    </div>
  );
}
