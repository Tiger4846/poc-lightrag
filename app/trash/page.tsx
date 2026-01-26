"use client";

import Sidebar from "../components/Sidebar";
import Image from "next/image";
import PageHeader from "../components/files/PageHeader";

export default function TrashPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <PageHeader />

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
