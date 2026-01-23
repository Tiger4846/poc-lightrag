"use client";

import Image from "next/image";
import Sidebar from "./components/Sidebar";
import { useState } from "react";

type FileItem = {
  name: string;
  owner: string;
  date: string;
  type: "folder" | "file";
  fileType?: "pdf" | "image" | "txt" | "doc";
  children?: FileItem[];
  recommend_status: boolean;
  delete_status: boolean;
  deleted_at: Date | null;
};

export default function Home() {
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

  const attachments = [
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.pdf", type: "pdf" },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.....", type: "image" },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.txt", type: "txt" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className=" px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-2xl borrder border-gray-300 bg-gray-100 rounded-full px-4 py-4 shadow-sm">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาอาจารย์, ใบเสนอ"
              className="flex-1 outline-none text-sm text-gray-600 placeholder-gray-400"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">WT</span>
            </div>
            <div className="text-sm">
              <div className="text-gray-500">: Waewpan</div>
              <div className="text-gray-500">: ศันติญธมมารณ์</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-8 pt-6 overflow-auto border border-gray-200 rounded-xl mx-4 mb-4 bg-white">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <button onClick={() => setCurrentPath([])} className="hover:text-red-600">โฟลเดอร์ของฉัน</button>
            {currentPath.map((folder, index) => (
              <div key={index} className="flex items-center gap-2">
                <span>/</span>
                <button 
                  onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                  className="hover:text-red-600"
                >
                  {folder}
                </button>
              </div>
            ))}
          </div>

          {/* Attachments Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">รายการแนะนำ</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recommendedFiles.map((file, index) => (
                <div key={index} className="relative group bg-white border border-gray-200 rounded-lg px-3 py-2 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-3">
                  {file.fileType === "pdf" && (
                    <>
                      <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 18v-2h8v2H8zm0-4v-2h8v2H8z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 truncate">{file.name}</div>
                      </div>
                    </>
                  )}
                  {file.fileType === "image" && (
                    <>
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 truncate">{file.name}</div>
                      </div>
                    </>
                  )}
                  {file.fileType === "txt" && (
                    <>
                      <div className="w-10 h-10 bg-gray-400 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2 6h6v2h-6v-2zm0 4h6v2h-6v-2z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 truncate">{file.name}</div>
                      </div>
                    </>
                  )}
                  {file.fileType === "doc" && (
                    <>
                      <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2 6h6v2h-6v-2zm0 4h6v2h-6v-2z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 truncate">{file.name}</div>
                      </div>
                    </>
                  )}
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenRecommendedMenuIndex(openRecommendedMenuIndex === index ? null : index);
                      }}
                      className="w-6 h-6 hover:bg-gray-100 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <span className="text-gray-600">⋯</span>
                    </button>
                    {openRecommendedMenuIndex === index && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenRecommendedMenuIndex(null)} />
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-48">
                          <div className="py-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
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
                                toggleDeleteStatus(getFilePath(file));
                                setOpenRecommendedMenuIndex(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="text-sm">ย้ายไปถังขยะ</span>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
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
                                toggleRecommendStatus(getFilePath(file));
                                setOpenRecommendedMenuIndex(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              <span className="text-sm">ยกเลิกแนะนำ</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
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
                  <div
                    key={index}
                    className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => {
                      if (folder.type === "folder") {
                        setCurrentPath([...currentPath, folder.name]);
                        setOpenMenuIndex(null);
                      }
                    }}
                  >
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuIndex(openMenuIndex === index ? null : index);
                        }}
                        className="absolute top-3 right-3 w-6 h-6 hover:bg-gray-100 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-gray-600">⋯</span>
                      </button>
                      {openMenuIndex === index && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenuIndex(null)} />
                          <div className="absolute right-0 top-12 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-48">
                            <div className="py-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDeleteStatus([...currentPath, folder.name]);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="text-sm">ย้ายไปถังขยะ</span>
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRecommendStatus([...currentPath, folder.name]);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <span className="text-sm">{folder.recommend_status ? 'ยกเลิกแนะนำ' : 'เพิ่มไฟล์ไปแนะนำ'}</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-start gap-3">
                      {folder.type === "folder" ? (
                        <svg className="w-12 h-12 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                        </svg>
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 18v-2h8v2H8zm0-4v-2h8v2H8z"/>
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-medium text-gray-900 mb-1">{folder.name}</div>
                        <div className="text-xs text-gray-500 mb-2">
                          {folder.type === "folder" ? "ชีปโฟลเดอร์ล่าสุดเมื่อ" : "แก้ไขล่าสุดเมื่อ"}
                        </div>
                        <div className="text-xs text-gray-600">{folder.date}</div>
                      </div>
                    </div>
                  </div>
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
                      <tr 
                        key={index} 
                        className="hover:bg-gray-50 cursor-pointer group"
                        onClick={() => {
                          if (folder.type === "folder") {
                            setCurrentPath([...currentPath, folder.name]);
                            setOpenMenuIndex(null);
                          }
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {folder.type === "folder" ? (
                              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 18v-2h8v2H8zm0-4v-2h8v2H8z"/>
                              </svg>
                            )}
                            <span className="text-sm text-gray-900">{folder.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">WT</span>
                            </div>
                            <span className="text-sm text-gray-900">{folder.owner}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{folder.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuIndex(openMenuIndex === index ? null : index);
                              }}
                              className="w-8 h-8 hover:bg-red-100 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="text-gray-600 hover:text-red-600">⋯</span>
                            </button>
                            {openMenuIndex === index && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuIndex(null)} />
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-48">
                                  <div className="py-1">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDeleteStatus([...currentPath, folder.name]);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      <span className="text-sm">ย้ายไปถังขยะ</span>
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleRecommendStatus([...currentPath, folder.name]);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                      </svg>
                                      <span className="text-sm">{folder.recommend_status ? 'ยกเลิกแนะนำ' : 'เพิ่มไฟล์ไปแนะนำ'}</span>
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
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
