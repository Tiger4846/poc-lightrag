"use client";
import { useEffect, useState } from "react";
import { FileItem } from "@/app/types/file";
import { fileService } from "@/lib/services/file.service";

interface OcrResultModalProps {
    file: FileItem | null;
    onClose: () => void;
}

export default function OcrResultModal({ file, onClose }: OcrResultModalProps) {
    const [markdownContent, setMarkdownContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMarkdownContent(null);
        setError(null);

        if (file && file.id && file.ocr_status) {
            setLoading(true);
            loadOcrResult();
        }
    }, [file]);

    const loadOcrResult = async () => {
        if (!file?.id) return;

        try {
            const response = await fileService.getOcrResult(file.id);
            setMarkdownContent(response.ocrContent || null);
        } catch (err: any) {
            console.error("Error loading OCR result:", err);
            setError("ไม่พบผลลัพธ์ OCR สำหรับไฟล์นี้");
        } finally {
            setLoading(false);
        }
    };

    if (!file) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-[#A61919] to-[#FF7B7B]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white truncate pr-4">{file.name}</h3>
                            <p className="text-white/80 text-sm">ผลลัพธ์ OCR</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gray-50 p-6 min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                            <span className="text-gray-500">กำลังโหลดผลลัพธ์ OCR...</span>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-gray-500 mb-2">{error}</p>
                            <p className="text-sm text-gray-400">ลอง OCR ไฟล์นี้ก่อน</p>
                        </div>
                    ) : markdownContent ? (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Markdown Content</span>
                                </div>
                            </div>
                            <div className="p-6 max-h-[500px] overflow-auto">
                                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                                    {markdownContent}
                                </pre>
                            </div>
                        </div>
                    ) : !file.ocr_status ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">ยังไม่ได้ OCR</h4>
                            <p className="text-gray-500">ไฟล์นี้ยังไม่ได้ทำ OCR กรุณากดปุ่ม OCR ก่อน</p>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center rounded-b-xl">
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${file.ocr_status
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {file.ocr_status ? '✓ OCR เสร็จแล้ว' : '○ รอ OCR'}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        {markdownContent && (
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(markdownContent);
                                    alert('คัดลอกแล้ว!');
                                }}
                                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                คัดลอก
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
