"use client";

import React, { useRef } from "react";
import { FileItem } from "@/app/types/file";

interface FileCardProps {
  file: FileItem;
  isMenuOpen: boolean;
  onToggleMenu: (e: React.MouseEvent) => void;
  onNavigate: () => void;
  onMoveToTrash: () => void;
  onToggleRecommend: () => void;
  onCloseMenu: () => void;
  isTrash?: boolean;
  onRestore?: () => void;
  onDeletePermanently?: () => void;
}

import FileActionMenu from "./FileActionMenu";

interface FileCardProps {
  file: FileItem;
  isMenuOpen: boolean;
  onToggleMenu: (e: React.MouseEvent) => void;
  onNavigate: () => void;
  onMoveToTrash: () => void;
  onToggleRecommend: () => void;
  onCloseMenu: () => void;
  isTrash?: boolean;
  onRestore?: () => void;
  onDeletePermanently?: () => void;
}

export default function FileCard({
  file,
  isMenuOpen,
  onToggleMenu,
  onNavigate,
  onMoveToTrash,
  onToggleRecommend,
  onCloseMenu,
  isTrash,
  onRestore,
  onDeletePermanently,
}: FileCardProps) {
  const menuRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className="relative bg-white border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onNavigate}
    >
      <div className="relative">
        <button
          ref={menuRef}
          onClick={onToggleMenu}
          className="absolute top-2 md:top-3 right-2 md:right-3 w-6 h-6 hover:bg-gray-100 rounded flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
        >
          <span className="text-gray-600">⋯</span>
        </button>
        <FileActionMenu
          file={file}
          isOpen={isMenuOpen}
          onClose={onCloseMenu}
          onMoveToTrash={onMoveToTrash}
          onToggleRecommend={onToggleRecommend}
          isTrash={isTrash}
          onRestore={onRestore}
          onDeletePermanently={onDeletePermanently}
          triggerRef={menuRef as React.RefObject<HTMLElement>}
        />
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
