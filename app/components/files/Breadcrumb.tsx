"use client";

import React from "react";

interface BreadcrumbProps {
  currentPath: string[];
  setCurrentPath: (path: string[]) => void;
}

export default function Breadcrumb({ currentPath, setCurrentPath }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
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
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
      <button onClick={() => setCurrentPath([])} className="hover:text-red-600">
        โฟลเดอร์ของฉัน
      </button>
      {currentPath.map((folder, index) => (
        <div key={index} className="flex items-center gap-2">
          <span>/</span>
          <button
            onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
            className="hover:text-red-600"
          >
            {folder}
          </button>
        </div>
      ))}
    </div>
  );
}
