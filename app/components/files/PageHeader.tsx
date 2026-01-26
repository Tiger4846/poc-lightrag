"use client";

import React from "react";

export default function PageHeader() {
  return (
    <header className="px-4 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-2xl border border-gray-300 bg-gray-100 rounded-full px-4 py-4 shadow-sm">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="ค้นหาอาจารย์, ใบเสนอ"
          className="flex-1 outline-none text-sm text-gray-600 placeholder-gray-400 bg-transparent"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-semibold">WT</span>
        </div>
        <div className="text-sm">
          <div className="text-gray-500">: Waewpan</div>
          <div className="text-gray-500">: ศันติญธมมารณ์</div>
        </div>
      </div>
    </header>
  );
}
