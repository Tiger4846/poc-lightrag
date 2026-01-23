"use client";

import Sidebar from "../components/Sidebar";
import Image from "next/image";

export default function TrashPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-2xl bg-gray-100 rounded-full px-4 py-4 shadow-sm">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

        {/* Content */}
        <main className="flex-1 px-8 pt-6 overflow-auto border border-gray-200 rounded-xl mx-4 mb-4 bg-white">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">ถังขยะ</h1>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <div className="w-[400px] h-[300px] mb-8">
              <Image
                src="/throw_away.svg"
                alt="Empty Trash"
                width={400}
                height={300}
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">ถังขยะว่างเปล่า</h2>
            <p className="text-sm text-gray-600 text-center max-w-md whitespace-nowrap">
              รายการนี้จะถูกย้ายไปที่ถังขยะ และจะถูกลบออกจากระบบอย่างถาวรหลังจาก 30 วัน
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
