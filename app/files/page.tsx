"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/files/PageHeader";
import Breadcrumb from "../components/files/Breadcrumb";
import FileCard from "../components/files/FileCard";
import FileListItem from "../components/files/FileListItem";
import { FileItem } from "../types/file";
import { useNavigation } from "../contexts/NavigationContext";

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [openRecommendedMenuIndex, setOpenRecommendedMenuIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nameuser, setNameuser] = useState<string>('User');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { files, currentPath, navigateToFolder, navigateToFolderId, refreshFiles, getCurrentItems } = useNavigation();
  
  // โหลด userName จาก localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNameuser(localStorage.getItem('userName') || 'User');
    }
  }, []);
  
  // โหลดข้อมูลจาก API เมื่อเริ่มต้น
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      Swal.fire({
        title: 'กำลังโหลด...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      try {
        await refreshFiles();
        Swal.close();
      } catch (error) {
        // Error already handled in context
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Sync URL parameter กับ navigation state
  useEffect(() => {
    if (files.length === 0) return; // รอให้โหลดไฟล์เสร็จก่อน

    const folderId = searchParams.get('folderId');
    navigateToFolderId(folderId);
  }, [searchParams, files]);

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

          // Refresh files to get updated data
          await refreshFiles();
          setOpenMenuIndex(null);
          setOpenRecommendedMenuIndex(null);

          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ!',
            text: 'ไฟล์ถูกย้ายไปถังขยะแล้ว',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            refreshFiles();
          });
        } catch (error: unknown) {
          console.error('Error deleting file:', error);
          const errorMessage = error && typeof error === 'object' && 'response' in error 
            ? (error.response as { data?: { message?: string } })?.data?.message 
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

      // Refresh to get updated data
      await refreshFiles();
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
        ? (error.response as { data?: { message?: string } })?.data?.message 
        : 'ไม่สามารถอัพเดทไฟล์ได้';
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
      });
    }
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

  const currentItems = getCurrentItems();
  const recommendedFiles = getRecommendedFiles();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <PageHeader name={nameuser} />

        {/* Content */}
        <main className="flex-1 px-8 pt-6 overflow-auto border border-gray-200 rounded-xl mx-4 mb-4 bg-white">
          <Breadcrumb />

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
                {currentItems.map((folder, index) => (
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
                      if (folder.type === "folder" && folder.id) {
                        router.push(`/files?folderId=${folder.id}`);
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
                    {currentItems.map((folder, index) => (
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
                          if (folder.type === "folder" && folder.id) {
                            router.push(`/files?folderId=${folder.id}`);
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
