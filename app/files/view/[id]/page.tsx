"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PublicFileViewPage() {
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [fileInfo, setFileInfo] = useState<{ name: string, type: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [textContent, setTextContent] = useState<string | null>(null);

    const viewUrl = `/api/files/view/${id}`;

    useEffect(() => {
        if (!id) return;

        // Note: We don't have a public "metadata" API yet, but we can try to guess or use the view endpoint headers
        // For simplicity, we just use the viewUrl directly for rendering.
        // But to show the filename, we'd ideally want a public info API.

        const fetchInfo = async () => {
            try {
                const response = await fetch(`/directory/api/files/public/${id}/info`);
                if (!response.ok) throw new Error("File not found");
                const data = await response.json();
                setFileInfo(data);
                setLoading(false);
            } catch (err) {
                setError("ไม่พบข้อมูลไฟล์ หรือไฟล์อาจถูกลบไปแล้ว");
                setLoading(false);
            }
        };

        fetchInfo();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
                    <span className="text-gray-500">กำลังโหลดไฟล์...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        ลองใหม่
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <img src="/swu_logo.webp" alt="SWU" className="w-6 h-6 object-contain" />
                    </div>
                    <h1 className="text-sm font-medium text-gray-700 truncate max-w-[200px] md:max-w-md">
                        {fileInfo?.name || "เอกสารต้นฉบับ"}
                    </h1>
                </div>
                {/* <a
                    href={viewUrl}
                    download
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    ดาวน์โหลด
                </a> */}
            </header>

            {/* Content Area */}
            <main className="flex-1 p-4 md:p-8 flex items-start justify-center overflow-auto">
                <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg shadow-black/5 overflow-hidden border border-gray-200 min-h-[70vh] flex flex-col">
                    <iframe
                        src={viewUrl}
                        className="w-full flex-1 border-none min-h-[75vh]"
                        title="Document Preview"
                    />
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="py-4 text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} SWU Directory. All rights reserved.
            </footer>
        </div>
    );
}
