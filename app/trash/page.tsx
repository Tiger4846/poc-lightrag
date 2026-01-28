"use client";

import Sidebar from "../components/Sidebar";
import Image from "next/image";
import PageHeader from "../components/files/PageHeader";
import { useEffect, useState } from "react";

export default function TrashPage() {
  const [nameuser, setNameuser] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userName') || 'User';
    }
    return 'User';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <PageHeader name={nameuser} onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        {/* Content */}
        <main className="flex-1 px-2 md:px-4 lg:px-8 pt-4 md:pt-6 overflow-auto border border-gray-200 rounded-xl mx-2 md:mx-4 mb-2 md:mb-4 bg-white">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 md:mb-8">ถังขยะ</h1>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center min-h-[400px] md:h-[calc(100vh-200px)]">
            <div className="w-full max-w-[280px] md:max-w-[400px] h-auto mb-6 md:mb-8">
              <Image
                src="/throw_away.svg"
                alt="Empty Trash"
                width={400}
                height={300}
                className="w-full h-auto object-contain"
              />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">ถังขยะว่างเปล่า</h2>
            <p className="text-sm text-gray-600 text-center max-w-md px-4 md:px-0">
              รายการนี้จะถูกย้ายไปที่ถังขยะ และจะถูกลบออกจากระบบอย่างถาวรหลังจาก 30 วัน
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
