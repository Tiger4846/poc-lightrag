"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useFolderCreate } from "@/hooks/useFolderCreate";

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    selectedFiles,
    handleFileSelect,
    removeFile,
    handleUpload,
    setSelectedFiles
  } = useFileUpload(() => setShowUploadModal(false));

  const {
    folderName,
    setFolderName,
    handleCreateFolder
  } = useFolderCreate(() => setShowCreateFolderModal(false));

  return (
    <>
      {/* Backdrop สำหรับ mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-64 lg:w-70 bg-white border-r border-gray-200 flex flex-col p-4
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex-shrink-0">
              <Image
                src="/lightrag-directory/project-logo.svg"
                alt="Document platform logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-xs md:text-sm">
              <div>
                <span className="font-semibold text-gray-600 hidden sm:inline">DOCUMENT PLATFORM</span>
                <span className="font-semibold text-gray-600 sm:hidden">DOCUMENTS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-gradient-to-r from-gray-900 to-gray-600 hover:bg-black hover:shadow-lg hover:scale-105 text-white rounded-full py-2.5 px-3 md:px-4 flex items-center justify-center gap-2 text-sm md:text-md font-semibold transition-all duration-200"
          >
            <span className="text-lg">+</span>
            <span className="hidden sm:inline">สร้างใหม่</span>
          </button>

          {/* Popup Menu */}
          {showModal && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowModal(false)} />
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors "
                    onClick={() => {
                      setShowModal(false);
                      setShowCreateFolderModal(true);
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span className="text-sm font-medium">โฟลเดอร์ใหม่</span>
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => {
                      setShowModal(false);
                      setShowUploadModal(true);
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-sm font-medium">อัปโหลดไฟล์</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          <Link
            href="/files"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-full ${pathname === "/"
              ? "text-gray-900 bg-gray-100"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-sm font-semibold">โฟลเดอร์ของฉัน</span>
          </Link>
          <Link
            href="/ocr"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-full ${pathname === "/ocr"
              ? "text-gray-900 bg-gray-100"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="text-sm font-semibold">OCR</span>
          </Link>
          <Link
            href="/recent"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-full ${pathname === "/recent"
              ? "text-gray-900 bg-gray-100"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold">ล่าสุด</span>
          </Link>
          <Link
            href="/trash"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-full ${pathname === "/trash"
              ? "text-gray-900 bg-gray-100"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-sm font-semibold">ถังขยะ</span>
          </Link>
        </nav>
      </aside>

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">อัปโหลดไฟล์</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileSelect}
              />
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer mb-4 ${selectedFiles.length > 0 ? 'border-gray-600 bg-gray-100' : 'border-gray-300 hover:border-gray-500'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className={`w-10 h-10 mx-auto mb-2 ${selectedFiles.length > 0 ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {selectedFiles.length > 0 ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">เลือกแล้ว {selectedFiles.length} ไฟล์</p>
                    <p className="text-xs text-gray-500">คลิกเพื่อเพิ่มไฟล์</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-1">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                    <p className="text-xs text-gray-400">รองรับไฟล์ทุกประเภท</p>
                  </>
                )}
              </div>

              {selectedFiles.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-center truncate">
                        <span className="truncate max-w-[180px] text-gray-700 font-medium" title={file.name}>{file.name}</span>
                        <span className="ml-2 text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 hover:shadow-lg hover:scale-105 rounded-lg font-medium transition-all duration-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-all duration-200 ${selectedFiles.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#111827] to-[#6B7280] hover:bg-black hover:shadow-lg hover:scale-105'}`}
              >
                อัปโหลด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setShowCreateFolderModal(false)}>
          <div className="bg-white rounded-lg p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">สร้างโฟลเดอร์ใหม่</h2>
              <button
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setFolderName("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="กรุณาระบุชื่อโฟลเดอร์"
                className="w-full px-3 py-2 border text-gray-400 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setFolderName("");
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 hover:shadow-lg hover:scale-105 rounded-lg font-medium transition-all duration-200"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-[#111827] to-[#6B7280] hover:bg-black hover:shadow-lg hover:scale-105 rounded-lg font-medium transition-all duration-200"
              >
                สร้าง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
