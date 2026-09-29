"use client";
import { useEffect, useState } from "react";
import { FileItem } from "@/app/types/file";
import { fileService } from "@/lib/services/file.service";

interface FilePreviewModalProps {
    file: FileItem | null;
    onClose: () => void;
}

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [textContent, setTextContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Reset state when file changes
        setPreviewUrl(null);
        setTextContent(null);
        setError(null);

        if (file && file.type === 'file' && file.id) {
            setLoading(true);

            const loadPreview = async () => {
                try {
                    const url = await fileService.getFilePreviewUrl(file.id!);
                    setPreviewUrl(url);
                } catch (err: any) {
                    console.error("Error loading preview:", err);
                    setError("ไม่สามารถโหลดไฟล์ตัวอย่างได้");
                } finally {
                    setLoading(false);
                }
            };

            loadPreview();
        }
    }, [file]);

    const isImage = file ? /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name) : false;
    const isPdf = file ? /\.(pdf)$/i.test(file.name) : false;
    const isVideo = file ? /\.(mp4|webm)$/i.test(file.name) : false;
    const isAudio = file ? /\.(mp3|wav)$/i.test(file.name) : false;
    const isText = file ? /\.(txt|md|markdown)$/i.test(file.name) : false;
    const isWord = file ? /\.(doc|docx)$/i.test(file.name) : false;

    // Fetch text content if it's a text file
    useEffect(() => {
        if (previewUrl && isText) {
            fetch(previewUrl)
                .then(res => res.text())
                .then(text => setTextContent(text))
                .catch(err => console.error("Error reading text content:", err));
        }
    }, [previewUrl, isText]);

    // Clean up object URL when component unmounts or previewUrl changes
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (!file) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 truncate pr-4">{file.name}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4 min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700"></div>
                            <span className="text-gray-500">กำลังโหลดตัวอย่าง...</span>
                        </div>
                    ) : error ? (
                        <div className="text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-gray-600 mb-2">{error}</p>
                        </div>
                    ) : previewUrl ? (
                        <>
                            {isImage && (
                                <img src={previewUrl} alt={file.name} className="max-w-full max-h-[70vh] object-contain shadow-sm" />
                            )}

                            {isPdf && (
                                <iframe src={previewUrl} className="w-full h-[70vh] rounded-lg border border-gray-200" title={file.name} />
                            )}

                            {isVideo && (
                                <video src={previewUrl} controls className="max-w-full max-h-[70vh] rounded-lg shadow-sm" />
                            )}

                            {isAudio && (
                                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                                    <div className="mb-4 flex justify-center">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                        </div>
                                    </div>
                                    <audio src={previewUrl} controls className="w-full" />
                                </div>
                            )}

                            {isText && textContent && (
                                <div className="w-full h-full max-h-[70vh] overflow-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                                        {textContent}
                                    </pre>
                                </div>
                            )}

                            {isWord && (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Microsoft Word Document</h4>
                                    <p className="text-gray-600 mb-4">ไม่สามารถแสดงตัวอย่างไฟล์ Word ได้ในขณะนี้<br />กรุณาดาวน์โหลดเพื่อเปิดดู</p>
                                </div>
                            )}

                            {/* Only show download button fallback if it's NOT one of the above */}
                            {!isImage && !isPdf && !isVideo && !isAudio && !isText && !isWord && (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 mb-4">ไม่สามารถแสดงตัวอย่างไฟล์ประเภทนี้ได้ในขณะนี้</p>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    {previewUrl && (
                        <a
                            href={previewUrl}
                            download={file.name}
                            className="px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            ดาวน์โหลด
                        </a>
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
    );
}
