"use client";

import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import Image from "next/image";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/files/PageHeader";
import FileCard from "../components/files/FileCard";
import FileListItem from "../components/files/FileListItem";
import { FileItem } from "../types/file";
import { useNavigation } from "../contexts/NavigationContext";
import { useFileActions } from "@/hooks/useFileActions";

export default function TrashPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [nameuser, setNameuser] = useState<string>('User');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deletedFiles, setDeletedFiles] = useState<FileItem[]>([]);

  const { files, refreshFiles } = useNavigation();
  const { restoreFile, deleteFilePermanently: deleteFilePermanentlyAction } = useFileActions();

  // Load userName
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNameuser(localStorage.getItem('userName') || 'User');
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    refreshFiles();
  }, []);

  // Filter deleted files from the file tree
  useEffect(() => {
    const getDeletedNodes = (nodes: FileItem[]): FileItem[] => {
      let results: FileItem[] = [];
      for (const node of nodes) {
        if (node.delete_status) {
          results.push(node);
        }

        if (node.children) {
          if (!node.delete_status) {
            results = results.concat(getDeletedNodes(node.children));
          }
        }
      }
      return results;
    };

    setDeletedFiles(getDeletedNodes(files));
  }, [files]);

  const handleRestore = async (file: FileItem) => {
    await restoreFile(file);
    setOpenMenuIndex(null);
  };

  const handleDeletePermanently = async (file: FileItem) => {
    await deleteFilePermanentlyAction(file);
    setOpenMenuIndex(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <PageHeader name={nameuser} onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        {/* Content */}
        <main className="flex-1 px-2 md:px-4 lg:px-8 pt-4 md:pt-6 overflow-auto border border-gray-200 rounded-xl mx-2 md:mx-4 mb-2 md:mb-4 bg-white">

          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">ถังขยะ</h1>

            {deletedFiles.length > 0 && (
              <div className="flex gap-1 md:gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 md:p-2 rounded ${viewMode === "grid" ? "text-gray-900 bg-gray-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 md:p-2 rounded ${viewMode === "list" ? "text-gray-900 bg-gray-100" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {deletedFiles.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[400px] md:h-[calc(100vh-200px)]">
              <div className="w-full max-w-[280px] md:max-w-[400px] h-auto mb-6 md:mb-8">
                <Image
                  src="/lightrag-directory/throw_away.svg"
                  alt="Empty Trash"
                  width={400}
                  height={300}
                  className="w-full h-auto object-contain"
                />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">ถังขยะว่างเปล่า</h2>
              <p className="text-sm text-gray-600 text-center max-w-md px-4 md:px-0">
                รายการนี้จะถูกย้ายไปที่ถังขยะ และจะถูกลบออกจากระบบอย่างถาวรหลังจาก 30 วัน
              </p>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {deletedFiles.map((file, index) => (
                    <FileCard
                      key={index}
                      file={file}
                      isMenuOpen={openMenuIndex === index}
                      onToggleMenu={(e) => {
                        e.stopPropagation();
                        setOpenMenuIndex(openMenuIndex === index ? null : index);
                      }}
                      onCloseMenu={() => setOpenMenuIndex(null)}
                      onNavigate={() => { }}
                      onMoveToTrash={() => { }} // Not used because isTrash is true
                      onToggleRecommend={() => { }} // Not used
                      isTrash={true}
                      onRestore={() => handleRestore(file)}
                      onDeletePermanently={() => handleDeletePermanently(file)}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อ</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เจ้าของ</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">วันที่ลบ</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {deletedFiles.map((file, index) => (
                        <FileListItem
                          key={index}
                          file={file}
                          isMenuOpen={openMenuIndex === index}
                          onToggleMenu={(e) => {
                            e.stopPropagation();
                            setOpenMenuIndex(openMenuIndex === index ? null : index);
                          }}
                          onCloseMenu={() => setOpenMenuIndex(null)}
                          onNavigate={() => { }}
                          onMoveToTrash={() => { }}
                          onToggleRecommend={() => { }}
                          isTrash={true}
                          onRestore={() => handleRestore(file)}
                          onDeletePermanently={() => handleDeletePermanently(file)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
