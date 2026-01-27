"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/files/PageHeader";
import Breadcrumb from "../components/files/Breadcrumb";
import FileCard from "../components/files/FileCard";
import FileListItem from "../components/files/FileListItem";
import { FileItem } from "../types/file";
import { buildFileTree } from "@/lib/utils/fileMapper";

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [openRecommendedMenuIndex, setOpenRecommendedMenuIndex] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const nameuser = localStorage.getItem('userName') || 'User';
  
  // โหลดข้อมูลจาก API
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        Swal.fire({
          title: 'กำลังโหลด...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

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

        const response = await axios.get('/api/files', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const fileTree = buildFileTree(response.data.files);
        setFiles(fileTree);
        Swal.close();
      } catch (error: unknown) {
        console.error('Error fetching files:', error);
        const errorMessage = error && typeof error === 'object' && 'response' in error 
          ? (error.response as any)?.data?.message 
          : 'ไม่สามารถโหลดข้อมูลไฟล์ได้';
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const toggleDeleteStatus = async (file: FileItem) => {
    if (!file.id) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่พบข้อมูลไฟล์',
      });
      return;
    }

    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "คุณต้องการย้ายไฟล์นี้ไปถังขยะใช่หรือไม่",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          await axios.put(
            `/api/files/${file.id}`,
            { deleteStatus: true },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          // อัพเดท state
          const updateItem = (items: FileItem[]): FileItem[] => {
            return items.map(item => {
              if (item.id === file.id) {
                return {
                  ...item,
                  delete_status: true,
                  deleted_at: new Date()
                };
              } else if (item.children) {
                return {
                  ...item,
                  children: updateItem(item.children)
                };
              }
              return item;
            });
          };

          setFiles(updateItem(files));
          setOpenMenuIndex(null);
          setOpenRecommendedMenuIndex(null);

          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ!',
            text: 'ไฟล์ถูกย้ายไปถังขยะแล้ว',
            showConfirmButton: false,
            timer: 1500
          });
        } catch (error: unknown) {
          console.error('Error deleting file:', error);
          const errorMessage = error && typeof error === 'object' && 'response' in error 
            ? (error.response as any)?.data?.message 
            : 'ไม่สามารถลบไฟล์ได้';
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: errorMessage,
          });
        }
      }
    });
  };

  const toggleRecommendStatus = async (file: FileItem) => {
    if (!file.id) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่พบข้อมูลไฟล์',
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/files/${file.id}`,
        { recommendStatus: !file.recommend_status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      // อัพเดท state
      const updateItem = (items: FileItem[]): FileItem[] => {
        return items.map(item => {
          if (item.id === file.id) {
            return {
              ...item,
              recommend_status: !item.recommend_status
            };
          } else if (item.children) {
            return {
              ...item,
              children: updateItem(item.children)
            };
          }
          return item;
        });
      };

      setFiles(updateItem(files));
      setOpenMenuIndex(null);
      setOpenRecommendedMenuIndex(null);

      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'ปรับปรุงสถานะแนะนำเรียบร้อยแล้ว',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error: unknown) {
      console.error('Error updating file:', error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as any)?.data?.message 
        : 'ไม่สามารถอัพเดทไฟล์ได้';
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
      });
    }
  };

  const getCurrentItems = (): FileItem[] => {
    let items = files;
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
    
    traverse(files);
    return recommended;
  };

  const folders = getCurrentItems();
  const recommendedFiles = getRecommendedFiles();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <PageHeader name={nameuser} />

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
                  onMoveToTrash={() => toggleDeleteStatus(file)}
                  onToggleRecommend={() => toggleRecommendStatus(file)}
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
                    onMoveToTrash={() => toggleDeleteStatus(folder)}
                    onToggleRecommend={() => toggleRecommendStatus(folder)}
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
                        onMoveToTrash={() => toggleDeleteStatus(folder)}
                        onToggleRecommend={() => toggleRecommendStatus(folder)}
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
