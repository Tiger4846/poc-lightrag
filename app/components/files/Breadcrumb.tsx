"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useNavigation } from "../../contexts/NavigationContext";

export default function Breadcrumb() {
  const router = useRouter();
  const { files, currentPath } = useNavigation();

  return (
    <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600 mb-4 md:mb-6 overflow-x-auto">
      <svg
        className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
      <button onClick={() => router.push('/files')} className="hover:text-gray-900 whitespace-nowrap">
        โฟลเดอร์ของฉัน
      </button>
      {currentPath.map((folderName, index) => {
        // หา folder ID โดยการ traverse ตาม path
        let items = files;
        let folderId: string | null = null;
        
        for (let i = 0; i <= index; i++) {
          const folder = items.find(item => item.name === currentPath[i] && item.type === "folder");
          if (folder) {
            folderId = folder.id || null;
            items = folder.children || [];
          }
        }

        return (
          <div key={index} className="flex items-center gap-1.5 md:gap-2">
            <span>/</span>
            <button
              onClick={() => folderId && router.push(`/files?folderId=${folderId}`)}
              className="hover:text-gray-900 whitespace-nowrap max-w-[100px] md:max-w-none truncate"
            >
              {folderName}
            </button>
          </div>
        );
      })}
    </div>
  );
}
