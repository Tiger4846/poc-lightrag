"use client";

import React, { useRef } from "react";
import { FileItem } from "@/app/types/file";

import FileActionMenu from "./FileActionMenu";

interface FileListItemProps {
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

export default function FileListItem({
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
}: FileListItemProps) {
  const menuRef = useRef<HTMLButtonElement>(null);

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer group"
      onClick={onNavigate}
    >
      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 md:gap-3">
          {file.type === "folder" ? (
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 18v-2h8v2H8zm0-4v-2h8v2H8z" />
            </svg>
          )}
          <span className="text-xs md:text-sm text-gray-900">{file.name}</span>
        </div>
      </td>
      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{file.owner.charAt(0)}</span>
          </div>
          <span className="text-sm text-gray-900">{file.owner}</span>
        </div>
      </td>
      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
        {file.date}
      </td>
      <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
        <div className="relative">
          <button
            ref={menuRef}
            onClick={onToggleMenu}
            className="w-8 h-8 hover:bg-red-100 rounded flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
          >
            <span className="text-gray-600 hover:text-red-600">⋯</span>
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
      </td>
    </tr>
  );
}
