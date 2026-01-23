"use client";

import Sidebar from "../components/Sidebar";

export default function RecentPage() {
  const pinnedFiles = [
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.....", type: "image" },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.txt", type: "txt" },
  ];

  const recentOpenFiles = [
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.txt", type: "txt" },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.pdf", type: "pdf" },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.....", type: "image" },
  ];

  const otherFiles = [
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.txt", type: "txt" },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.....", type: "image" },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.pdf", type: "pdf" },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.txt", type: "txt" },
    { name: "ศูนพ์ใช้ง่อง รุ่น 24.....", type: "image" },
  ];

  const FileCard = ({ name, type }: { name: string; type: string }) => {
    return (
      <div className="relative group bg-white border border-gray-200 rounded-lg px-3 py-3 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-3 w-[280px]">
        {type === "pdf" && (
          <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 18v-2h8v2H8zm0-4v-2h8v2H8z"/>
            </svg>
          </div>
        )}
        {type === "image" && (
          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {type === "txt" && (
          <div className="w-10 h-10 bg-gray-400 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2 6h6v2h-6v-2zm0 4h6v2h-6v-2z"/>
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-900 truncate">{name}</div>
        </div>
        <button className="w-6 h-6 hover:bg-gray-100 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <span className="text-gray-600">⋯</span>
        </button>
      </div>
    );
  };

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
          {/* Title */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">ล่าสุด</h1>
            <div className="flex items-center gap-4">
              <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700">
                <option>วันที่ปับ</option>
                <option>เรียง</option>
                <option>ชื่อ</option>
                <option>วันที่</option>
              </select>
            </div>
          </div>

          {/* Pinned Files Section */}
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-4">สิ่งที่ปักหมุด</h2>
            <div className="flex flex-wrap gap-4">
              {pinnedFiles.map((file, index) => (
                <FileCard key={index} name={file.name} type={file.type} />
              ))}
            </div>
          </section>

          {/* Recent Open Files Section */}
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-4">เปิดล่าสุด</h2>
            <div className="flex flex-wrap gap-4">
              {recentOpenFiles.map((file, index) => (
                <FileCard key={index} name={file.name} type={file.type} />
              ))}
            </div>
          </section>

          {/* Other Files Section */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-4">อีกแล้ว</h2>
            <div className="flex flex-wrap gap-4">
              {otherFiles.map((file, index) => (
                <FileCard key={index} name={file.name} type={file.type} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
