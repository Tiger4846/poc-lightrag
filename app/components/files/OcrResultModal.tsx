"use client";
import { useEffect, useState } from "react";
import { FileItem } from "@/app/types/file";
import { fileService } from "@/lib/services/file.service";

interface OcrResultModalProps {
    file: FileItem | null;
    onClose: () => void;
    onUpdate?: () => void;
}

export default function OcrResultModal({ file, onClose, onUpdate }: OcrResultModalProps) {
    const [markdownContent, setMarkdownContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setMarkdownContent(null);
        setError(null);
        setIsEditing(false);

        if (file && file.id && file.ocr_status === 'SUCCESS') {
            setLoading(true);
            loadOcrResult();
        }
    }, [file]);

    const loadOcrResult = async () => {
        if (!file?.id) return;

        try {
            const response = await fileService.getOcrResult(file.id);
            const content = response.ocrContent || "";
            setMarkdownContent(content);
            setEditedContent(content);
        } catch (err: any) {
            console.error("Error loading OCR result:", err);
            setError("ไม่พบผลลัพธ์ OCR สำหรับไฟล์นี้");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!file?.id) return;

        try {
            setSaving(true);
            await fileService.updateOcrResult(file.id, editedContent);
            setMarkdownContent(editedContent);
            setIsEditing(false);
            alert("บันทึกเรียบร้อย");
        } catch (err: any) {
            console.error("Error updating OCR result:", err);
            alert("เกิดข้อผิดพลาดในการบันทึก: " + (err.message || "Unknown error"));
        } finally {
            setSaving(false);
        }
    };

    const handleUploadToLightRag = async () => {
        if (!file?.id) return;

        // If editing, ask to save first or just warn
        if (isEditing) {
            if (!confirm("คุณกำลังแก้ไขอยู่ ต้องการบันทึกก่อน Upload หรือไม่? (Cancel เพื่อ Upload เนื้อหาล่าสุดที่บันทึกไว้)")) {
                // Proceed with upload using currently SAVED markdownContent (not editedContent)
            } else {
                await handleSave();
            }
        }

        try {
            setUploading(true);
            await fileService.uploadToLightRag(file.id);
            alert("Upload to LightRAG successful!");
            if (onUpdate) onUpdate();
        } catch (err: any) {
            console.error("Error uploading to LightRAG:", err);
            alert("Failed to upload: " + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteFromLightRag = async () => {
        if (!file?.id) return;

        if (!confirm("คุณต้องการลบไฟล์นี้ออกจาก LightRAG ใช่หรือไม่?")) return;

        try {
            setUploading(true); // Reuse uploading state for loading indicator
            await fileService.deleteFromLightRag(file.id);
            alert("Delete from LightRAG successful!");
            if (onUpdate) onUpdate();
            onClose(); // Close modal after delete
        } catch (err: any) {
            console.error("Error deleting from LightRAG:", err);
            if (err?.response?.status === 503 || err?.response?.status === 409) {
                alert("ระบบไม่ว่าง: " + (err.response?.data?.message || err.message));
            } else {
                alert("Failed to delete: " + (err.response?.data?.message || err.message));
            }
        } finally {
            setUploading(false);
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
                    ) : markdownContent !== null ? (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
                            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Markdown Content</span>
                                    {isEditing && <span className="text-xs text-orange-500 font-bold ml-2">(Editing)</span>}
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            <div className="p-0 flex-1 relative min-h-[400px]">
                                {isEditing ? (
                                    <textarea
                                        className="w-full h-full p-6 font-mono text-sm text-gray-800 leading-relaxed focus:outline-none resize-none"
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                    />
                                ) : (
                                    <div className="p-6 h-full overflow-auto">
                                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                                            {markdownContent}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : file.ocr_status !== 'SUCCESS' ? (
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
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${file.ocr_status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                            file.ocr_status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                                file.ocr_status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                            }`}>
                            {file.ocr_status === 'SUCCESS' ? '✓ OCR เสร็จแล้ว' :
                                file.ocr_status === 'PENDING' ? '⟳ กำลังทำ' :
                                    file.ocr_status === 'FAILED' ? '✗ ล้มเหลว' :
                                        'รอดำเนินการ'}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        {markdownContent && !isEditing && (
                            <>
                                {file.lightrag_status === 'UPLOADED' ? (
                                    <button
                                        onClick={handleDeleteFromLightRag}
                                        disabled={uploading}
                                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {uploading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete from LightRAG
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleUploadToLightRag}
                                        disabled={uploading}
                                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {uploading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                Upload to LightRAG
                                            </>
                                        )}
                                    </button>
                                )}
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
                            </>
                        )}

                        {isEditing && (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedContent(markdownContent || "");
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </>
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
