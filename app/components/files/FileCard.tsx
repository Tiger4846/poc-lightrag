"use client";

import React from "react";
import { FileItem } from "@/app/types/file";

interface FileCardProps {
  file: FileItem;
  isMenuOpen: boolean;
  onToggleMenu: (e: React.MouseEvent) => void;
  onNavigate: () => void;
  onMoveToTrash: () => void;
  onToggleRecommend: () => void;
  onCloseMenu: () => void;
}

export default function FileCard({
  file,
  isMenuOpen,
  onToggleMenu,
  onNavigate,
  onMoveToTrash,
  onToggleRecommend,
  onCloseMenu,
}: FileCardProps) {
  return (
    <div
      className="relative bg-white border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onNavigate}
    >
      <div className="relative">
        <button
          onClick={onToggleMenu}
          className="absolute top-2 md:top-3 right-2 md:right-3 w-6 h-6 hover:bg-gray-100 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <span className="text-gray-600">⋯</span>
        </button>
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                onCloseMenu();
              }}
            />
            <div className="absolute right-0 top-12 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-48">
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToTrash();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span className="text-sm">ย้ายไปถังขยะ</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleRecommend();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-left"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <span className="text-sm">
                    {file.recommend_status
                      ? "ยกเลิกแนะนำ"
                      : "เพิ่มไฟล์ไปแนะนำ"}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex items-start gap-2 md:gap-3">
        {file.type === "folder" ? (
          <svg
            className="w-10 h-10 md:w-12 md:h-12 text-yellow-500 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
        ) : (
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-gray-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 18v-2h8v2H8zm0-4v-2h8v2H8z" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-base font-medium text-gray-900 mb-1">
            {file.name}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {file.type === "folder"
              ? "ปรับปรุงล่าสุดเมื่อ"
              : "แก้ไขล่าสุดเมื่อ"}
          </div>
          <div className="text-xs text-gray-600">{file.date}</div>
        </div>
      </div>
    </div>
  );
}
