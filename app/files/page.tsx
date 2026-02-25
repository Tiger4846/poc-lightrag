"use client";

import { useState, useEffect, useMemo } from "react";
import Swal from 'sweetalert2';
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/files/PageHeader";
import Breadcrumb from "../components/files/Breadcrumb";
import FileCard from "../components/files/FileCard";
import FileListItem from "../components/files/FileListItem";
import FilePreviewModal from "../components/files/FilePreviewModal";
import { FileItem } from "../types/file";
import { useNavigation } from "../contexts/NavigationContext";
import { useFileActions } from "@/hooks/useFileActions";

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<string>("default");
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [openRecommendedMenuIndex, setOpenRecommendedMenuIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nameuser, setNameuser] = useState<string>('User');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { files, currentPath, navigateToFolder, navigateToFolderId, refreshFiles, getCurrentItems } = useNavigation();
  const { toggleDeleteStatus: deleteFileAction, toggleRecommendStatus: recommendFileAction } = useFileActions();

  // โหลด userName จาก localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNameuser(localStorage.getItem('userName') || 'User');
    }
  }, []);

  // โหลดข้อมูลจาก API เมื่อเริ่มต้น
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("directoryToken");

      if (!token) {
        router.replace("/login");
        return;
      }

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
        Swal.close();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Sync URL parameter กับ navigation state
  useEffect(() => {
    if (files.length === 0) return; // รอให้โหลดไฟล์เสร็จก่อน

    const folderId = searchParams.get('folderId');
    navigateToFolderId(folderId);
  }, [searchParams, files]);

  const toggleDeleteStatus = async (file: FileItem) => {
    await deleteFileAction(file);
    setOpenMenuIndex(null);
    setOpenRecommendedMenuIndex(null);
  };

  const toggleRecommendStatus = async (file: FileItem) => {
    await recommendFileAction(file);
    setOpenMenuIndex(null);
    setOpenRecommendedMenuIndex(null);
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

  // Helper for search
  const getAllFilesFlat = (items: FileItem[]): FileItem[] => {
    let results: FileItem[] = [];
    for (const item of items) {
      if (!item.delete_status) {
        results.push(item);
        if (item.children) {
          results = [...results, ...getAllFilesFlat(item.children)];
        }
      }
    }
    return results;
  };

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const all = getAllFilesFlat(files);
    return all.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, files]);

  const itemsToDisplay = searchTerm ? searchResults : currentItems;

  const sortedItems = useMemo(() => {
    if (sortBy === 'default') return itemsToDisplay;
    const items = [...itemsToDisplay];
    if (sortBy === 'name') {
      return items.sort((a, b) => a.name.localeCompare(b.name, 'th'));
    }
    if (sortBy === 'date') {
      return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return items;
  }, [itemsToDisplay, sortBy]);
  const recommendedFiles = getRecommendedFiles();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <PageHeader
          name={nameuser}
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
        />

        {/* Content */}
        <main className="flex-1 px-2 md:px-4 lg:px-8 pt-4 md:pt-6 overflow-auto border border-gray-200 rounded-xl mx-2 md:mx-4 mb-2 md:mb-4 bg-white">
          {!searchTerm && <Breadcrumb />}

          {/* Attachments Section - Hide when searching */}
          {!searchTerm && (
            <section className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4">รายการแนะนำ</h2>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
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
                      if (file.type === 'file') {
                        setPreviewFile(file);
                      }
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
          )}

          {/* Folders Section */}
          <section>
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                {searchTerm ? `ผลการค้นหา "${searchTerm}" (${sortedItems.length})` : 'ไฟล์ทั้งหมด'}
              </h2>
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex gap-1 md:gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 md:p-2 rounded ${viewMode === "grid" ? "text-red-600 bg-red-50" : "text-gray-600 hover:text-red-600 hover:bg-red-50"}`}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 md:p-2 rounded ${viewMode === "list" ? "text-red-600 bg-red-50" : "text-gray-600 hover:text-red-600 hover:bg-red-50"}`}
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm border border-gray-300 rounded-md bg-white text-gray-700 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="default">เรียง (Default)</option>
                  <option value="name">ชื่อ</option>
                  <option value="date">วันที่ล่าสุด</option>
                </select>
              </div>
            </div>

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {sortedItems.map((folder, index) => (
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
                      } else if (folder.type === "file") {
                        setPreviewFile(folder);
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
              <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อ</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เจ้าของ</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">วันที่อัพโหลด</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedItems.map((folder, index) => (
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
                          } else if (folder.type === "file") {
                            setPreviewFile(folder);
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

      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
