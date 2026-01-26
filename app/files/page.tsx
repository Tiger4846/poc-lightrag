"use client";

import { useState } from "react";
import Swal from 'sweetalert2';
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/files/PageHeader";
import Breadcrumb from "../components/files/Breadcrumb";
import FileCard from "../components/files/FileCard";
import FileListItem from "../components/files/FileListItem";
import { FileItem } from "../types/file";

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [openRecommendedMenuIndex, setOpenRecommendedMenuIndex] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  
  const allFilesData: FileItem[] = [
    { 
      name: "งานบุคลิ่น", 
      owner: "Waewpan", 
      date: "12 ธ.ค. 2568",
      type: "folder",
      recommend_status: false,
      delete_status: false,
      deleted_at: null,
      children: [
        { name: "ประกาศรับสมัคร", owner: "Waewpan", date: "10 ธ.ค. 2568", type: "folder", recommend_status: false, delete_status: false, deleted_at: null, children: [
          { name: "ประกาศรับสมัคร_2568.pdf", owner: "Waewpan", date: "8 ธ.ค. 2568", type: "file", fileType: "pdf", recommend_status: true, delete_status: false, deleted_at: null },
          { name: "เอกสารแนบ.pdf", owner: "Waewpan", date: "8 ธ.ค. 2568", type: "file", fileType: "pdf", recommend_status: false, delete_status: false, deleted_at: null },
        ]},
        { name: "ใบสมัคร.pdf", owner: "Waewpan", date: "9 ธ.ค. 2568", type: "file", fileType: "pdf", recommend_status: true, delete_status: false, deleted_at: null },
        { name: "รูปถ่าย.jpg", owner: "Waewpan", date: "9 ธ.ค. 2568", type: "file", fileType: "image", recommend_status: true, delete_status: false, deleted_at: null },
      ]
    },
    { 
      name: "งานวิสสัตการ", 
      owner: "Waewpan", 
      date: "12 ธ.ค. 2568",
      type: "folder",
      recommend_status: false,
      delete_status: false,
      deleted_at: null,
      children: [
        { name: "เอกสารภาคต้น", owner: "Waewpan", date: "5 ธ.ค. 2568", type: "folder", recommend_status: false, delete_status: false, deleted_at: null, children: [
          { name: "รายงานผล_ภาคต้น.doc", owner: "Waewpan", date: "3 ธ.ค. 2568", type: "file", fileType: "doc", recommend_status: false, delete_status: false, deleted_at: null },
        ]},
        { name: "เอกสารภาคปลาย", owner: "Waewpan", date: "11 ธ.ค. 2568", type: "folder", recommend_status: false, delete_status: false, deleted_at: null, children: [
          { name: "รายงานผล_ภาคปลาย.doc", owner: "Waewpan", date: "10 ธ.ค. 2568", type: "file", fileType: "doc", recommend_status: false, delete_status: false, deleted_at: null },
        ]},
      ]
    },
    { 
      name: "งานและแนวทับก้รับหาง", 
      owner: "Waewpan", 
      date: "12 ธ.ค. 2568",
      type: "folder",
      recommend_status: false,
      delete_status: false,
      deleted_at: null,
      children: [
        { name: "รายงาน_2568.pdf", owner: "Waewpan", date: "11 ธ.ค. 2568", type: "file", fileType: "pdf", recommend_status: false, delete_status: false, deleted_at: null },
        { name: "สรุปผล.txt", owner: "Waewpan", date: "11 ธ.ค. 2568", type: "file", fileType: "txt", recommend_status: false, delete_status: false, deleted_at: null },
      ]
    },
    { 
      name: "งานวีึกรรมบสิต", 
      owner: "Waewpan", 
      date: "12 ธ.ค. 2568",
      type: "folder",
      recommend_status: false,
      delete_status: false,
      deleted_at: null,
      children: []
    },
    { 
      name: "งานทุน ทศธ", 
      owner: "Waewpan", 
      date: "12 ธ.ค. 2568",
      type: "folder",
      recommend_status: false,
      delete_status: false,
      deleted_at: null,
      children: [
        { name: "ทุนการศึกษา", owner: "Waewpan", date: "7 ธ.ค. 2568", type: "folder", recommend_status: false, delete_status: false, deleted_at: null, children: [
          { name: "รายชื่อผู้สมัคร.pdf", owner: "Waewpan", date: "5 ธ.ค. 2568", type: "file", fileType: "pdf", recommend_status: false, delete_status: false, deleted_at: null },
          { name: "เกณฑ์การพิจารณา.doc", owner: "Waewpan", date: "5 ธ.ค. 2568", type: "file", fileType: "doc", recommend_status: false, delete_status: false, deleted_at: null },
        ]},
      ]
    },
    { 
      name: "งานหอทิึก", 
      owner: "Waewpan", 
      date: "12 ธ.ค. 2568",
      type: "folder",
      recommend_status: false,
      delete_status: false,
      deleted_at: null,
      children: []
    },
    { 
      name: "การสอบทางวิึกศ์นูม", 
      owner: "Waewpan", 
      date: "6 ธ.ค. 2567",
      type: "folder",
      recommend_status: false,
      delete_status: false,
      deleted_at: null,
      children: [
        { name: "ตารางสอบ.pdf", owner: "Waewpan", date: "4 ธ.ค. 2567", type: "file", fileType: "pdf", recommend_status: false, delete_status: true, deleted_at: new Date("2024-12-01") },
      ]
    },
    { 
      name: "งานลงทะเบีย", 
      owner: "Waewpan", 
      date: "6 ธ.ค. 2567",
      type: "folder",
      recommend_status: false,
      delete_status: false,
      deleted_at: null,
      children: [
        { name: "คู่มือลงทะเบียน.pdf", owner: "Waewpan", date: "1 ธ.ค. 2567", type: "file", fileType: "pdf", recommend_status: false, delete_status: false, deleted_at: null },
        { name: "ตารางเรียน.jpg", owner: "Waewpan", date: "1 ธ.ค. 2567", type: "file", fileType: "image", recommend_status: false, delete_status: false, deleted_at: null },
      ]
    },
  ];

  const [files, setFiles] = useState<FileItem[]>(allFilesData);

  const toggleDeleteStatus = (itemPath: string[]) => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการย้ายไฟล์นี้ไปถังขยะใช่หรือไม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        const updateItem = (items: FileItem[], path: string[], depth: number): FileItem[] => {
          return items.map(item => {
            if (path[depth] === item.name) {
              if (depth === path.length - 1) {
                return {
                  ...item,
                  delete_status: true,
                  deleted_at: new Date()
                };
              } else if (item.children) {
                return {
                  ...item,
                  children: updateItem(item.children, path, depth + 1)
                };
              }
            }
            return item;
          });
        };
        
        setFiles(updateItem(files, itemPath, 0));
        setOpenMenuIndex(null);
        setOpenRecommendedMenuIndex(null);

        Swal.fire({
          icon: 'success',
          title: 'ลบสำเร็จ!',
          text: 'ไฟล์ถูกย้ายไปถังขยะแล้ว',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  };

  const toggleRecommendStatus = (itemPath: string[]) => {
    const updateItem = (items: FileItem[], path: string[], depth: number): FileItem[] => {
      return items.map(item => {
        if (path[depth] === item.name) {
          if (depth === path.length - 1) {
            return {
              ...item,
              recommend_status: !item.recommend_status
            };
          } else if (item.children) {
            return {
              ...item,
              children: updateItem(item.children, path, depth + 1)
            };
          }
        }
        return item;
      });
    };
    
    setFiles(updateItem(files, itemPath, 0));
    setOpenMenuIndex(null);
    setOpenRecommendedMenuIndex(null);

    Swal.fire({
      icon: 'success',
      title: 'สำเร็จ',
      text: 'ปรับปรุงสถานะแนะนำเรียบร้อยแล้ว',
      showConfirmButton: false,
      timer: 1500
    });
  };

  const getCurrentItems = (): FileItem[] => {
    let items = files.length > 0 ? files : allFilesData;
    for (const folderName of currentPath) {
      const folder = items.find(item => item.name === folderName);
      if (folder && folder.children) {
        items = folder.children;
      }
    }
    // Filter out deleted items and recommended items from main view
    return items.filter(item => !item.delete_status && !item.recommend_status);
  };

  const getRecommendedFiles = (): FileItem[] => {
    const recommended: FileItem[] = [];
    
    const traverse = (items: FileItem[]) => {
      for (const item of items) {
        if (item.recommend_status && !item.delete_status && item.type === "file") {
          recommended.push(item);
        }
        if (item.children) {
          traverse(item.children);
        }
      }
    };
    
    traverse(files.length > 0 ? files : allFilesData);
    return recommended;
  };

  const folders = getCurrentItems();
  const recommendedFiles = getRecommendedFiles();

  const getFilePath = (file: FileItem): string[] => {
    const findPath = (items: FileItem[], target: FileItem, currentPath: string[] = []): string[] | null => {
      for (const item of items) {
        if (item === target) {
          return [...currentPath, item.name];
        }
        if (item.children) {
          const result = findPath(item.children, target, [...currentPath, item.name]);
          if (result) return result;
        }
      }
      return null;
    };
    return findPath(files, file) || [file.name];
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <PageHeader />

        {/* Content */}
        <main className="flex-1 px-8 pt-6 overflow-auto border border-gray-200 rounded-xl mx-4 mb-4 bg-white">
          <Breadcrumb currentPath={currentPath} setCurrentPath={setCurrentPath} />

          {/* Attachments Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">รายการแนะนำ</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recommendedFiles.map((file, index) => (
                <FileCard
                  key={index}
                  file={file}
                  isMenuOpen={openRecommendedMenuIndex === index}
                  onToggleMenu={(e) => {
                    e.stopPropagation();
                    setOpenRecommendedMenuIndex(openRecommendedMenuIndex === index ? null : index);
                  }}
                  onCloseMenu={() => setOpenRecommendedMenuIndex(null)}
                  onNavigate={() => {
                   // Recommended files usually open preview, but here we treat them as maybe clickable if they were folders (they are files)
                  }}
                  onMoveToTrash={() => toggleDeleteStatus(getFilePath(file))}
                  onToggleRecommend={() => toggleRecommendStatus(getFilePath(file))}
                />
              ))}
              {recommendedFiles.length === 0 && (
                <div className="text-gray-500 text-sm">ไม่มีไฟล์แนะนำในขณะนี้</div>
              )}
            </div>
          </section>

          {/* Folders Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">ไฟล์ทั้งหมด</h2>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${viewMode === "grid" ? "text-red-600 bg-red-50" : "text-gray-600 hover:text-red-600 hover:bg-red-50"}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${viewMode === "list" ? "text-red-600 bg-red-50" : "text-gray-600 hover:text-red-600 hover:bg-red-50"}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
                <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700">
                  <option>เรียง</option>
                  <option>ชื่อ</option>
                  <option>วันที่</option>
                </select>
              </div>
            </div>

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder, index) => (
                  <FileCard
                    key={index}
                    file={folder}
                    isMenuOpen={openMenuIndex === index}
                    onToggleMenu={(e) => {
                      e.stopPropagation();
                      setOpenMenuIndex(openMenuIndex === index ? null : index);
                    }}
                    onCloseMenu={() => setOpenMenuIndex(null)}
                    onNavigate={() => {
                      if (folder.type === "folder") {
                        setCurrentPath([...currentPath, folder.name]);
                        setOpenMenuIndex(null);
                      }
                    }}
                    onMoveToTrash={() => toggleDeleteStatus([...currentPath, folder.name])}
                    onToggleRecommend={() => toggleRecommendStatus([...currentPath, folder.name])}
                  />
                ))}
              </div>
            )}

            {/* List/Table View */}
            {viewMode === "list" && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อ</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เจ้าของ</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">วันที่อัพโหลด</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {folders.map((folder, index) => (
                       <FileListItem
                        key={index}
                        file={folder}
                        isMenuOpen={openMenuIndex === index}
                        onToggleMenu={(e) => {
                          e.stopPropagation();
                          setOpenMenuIndex(openMenuIndex === index ? null : index);
                        }}
                        onCloseMenu={() => setOpenMenuIndex(null)}
                        onNavigate={() => {
                          if (folder.type === "folder") {
                            setCurrentPath([...currentPath, folder.name]);
                            setOpenMenuIndex(null);
                          }
                        }}
                        onMoveToTrash={() => toggleDeleteStatus([...currentPath, folder.name])}
                        onToggleRecommend={() => toggleRecommendStatus([...currentPath, folder.name])}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
