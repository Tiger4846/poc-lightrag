"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/files/PageHeader";
import FileCard from "../components/files/FileCard";
import { FileItem } from "../types/file";
import Swal from 'sweetalert2';
import { useNavigation } from "../contexts/NavigationContext";
import { useFileActions } from "@/hooks/useFileActions";

export default function RecentPage() {
  const [openMenuIndex, setOpenMenuIndex] = useState<{ section: string, index: number } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [nameuser, setNameuser] = useState<string>('User');
  const [loading, setLoading] = useState<boolean>(true);

  const { files, refreshFiles } = useNavigation();
  const { toggleDeleteStatus: deleteFileAction, toggleRecommendStatus: recommendFileAction } = useFileActions();

  // Load userName
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNameuser(localStorage.getItem('userName') || 'User');
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await refreshFiles();
      } catch (error) {
        console.error("Error loading files", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const allFiles = useMemo(() => {
    const flattened: FileItem[] = [];

    // Recursive flatten function
    const traverse = (items: FileItem[]) => {
      for (const item of items) {
        if (!item.delete_status) {
          // We generally want to show files in "Recent", folders might be confusing if empty?
          // But if a folder was created recently, maybe show it?
          // User said "upload of file", so let's stick to type="file".
          if (item.type === "file") {
            flattened.push(item);
          }
          if (item.children) {
            traverse(item.children);
          }
        }
      }
    };

    traverse(files);

    // Sort by createdAt desc
    return flattened.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [files]);

  const recommendedFiles = useMemo(() => {
    return allFiles.filter(f => f.recommend_status);
  }, [allFiles]);

  const recentFiles = useMemo(() => {
    // Exclude recommended ones to avoid duplicates? Or just show the top recent?
    // Usually "Recent" shows everything sorted by time.
    // "Pinned/Recommended" shows specific ones.
    // Let's show top 20 recent files.
    return allFiles.slice(0, 20);
  }, [allFiles]);


  const toggleDeleteStatus = async (file: FileItem) => {
    await deleteFileAction(file);
    setOpenMenuIndex(null);
  };

  const toggleRecommendStatus = async (file: FileItem) => {
    await recommendFileAction(file);
    setOpenMenuIndex(null);
  };

  const renderFileSection = (title: string, items: FileItem[], sectionId: string) => {
    if (items.length === 0) return null;

    return (
      <section className="mb-6 md:mb-8">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">{title}</h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {items.map((file, index) => (
            <FileCard
              key={`${file.id}-${index}`}
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
              onNavigate={() => { }}
              onMoveToTrash={() => toggleDeleteStatus(file)}
              onToggleRecommend={() => toggleRecommendStatus(file)}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <PageHeader name={nameuser} onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        {/* Content */}
        <main className="flex-1 px-2 md:px-4 lg:px-8 pt-4 md:pt-6 overflow-auto border border-gray-200 rounded-xl mx-2 md:mx-4 mb-2 md:mb-4 bg-white">
          {/* Title */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">ล่าสุด</h1>
            <div className="flex items-center gap-2 md:gap-4">
              {/* Sort options - Currently static/mock functionality as logic handles 'date' mostly */}
              <select className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm border border-gray-300 rounded-md bg-white text-gray-700">
                <option>วันที่อัพล่าสุด</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">กำลังโหลดข้อมูล...</div>
          ) : (
            <>
              {renderFileSection("แนะนำ (Recommended)", recommendedFiles, "recommended")}
              {renderFileSection("อัปโหลดล่าสุด", recentFiles, "recent")}

              {allFiles.length === 0 && (
                <div className="text-center py-10 text-gray-500">ไม่มีไฟล์ในระบบ</div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}
