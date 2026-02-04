"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Swal from 'sweetalert2';
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/files/PageHeader";
import FileCard from "../components/files/FileCard";
import FileListItem from "../components/files/FileListItem";
import FilePreviewModal from "../components/files/FilePreviewModal";
import OcrResultModal from "../components/files/OcrResultModal";
import { FileItem } from "../types/file";
import { useNavigation } from "../contexts/NavigationContext";
import { useFileActions } from "@/hooks/useFileActions";
import { fileService } from "@/lib/services/file.service";

export default function OcrPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [sortBy, setSortBy] = useState<string>("default");
    const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [nameuser, setNameuser] = useState<string>('User');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
    const [ocrResultFile, setOcrResultFile] = useState<FileItem | null>(null);
    const [mounted, setMounted] = useState(false);

    // OCR States
    const [ocrStatus, setOcrStatus] = useState({
        totalFiles: 0,
        ocrCompleted: 0,
        ocrPending: 0,
        ocrUnprocessed: 0,
        ocrProcessing: 0,
        ocrFailed: 0
    });
    // ocrLoading removed as it was unused
    const [isProcessingOcr, setIsProcessingOcr] = useState(false);

    const { files, refreshFiles } = useNavigation();
    const { toggleDeleteStatus: deleteFileAction, toggleRecommendStatus: recommendFileAction } = useFileActions();

    // โหลด userName จาก localStorage and mark as mounted
    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            setNameuser(localStorage.getItem('userName') || 'User');
        }
    }, []);

    // Fetch OCR status
    const fetchOcrStatus = async () => {
        try {
            const data = await fileService.getOcrStatus();
            // Ensure all fields exist with fallback values
            setOcrStatus({
                totalFiles: data.totalFiles || 0,
                ocrCompleted: data.ocrCompleted || 0,
                ocrPending: data.ocrPending || 0,
                ocrUnprocessed: data.ocrUnprocessed || 0,
                ocrProcessing: data.ocrProcessing || 0,
                ocrFailed: data.ocrFailed || 0
            });
        } catch (error) {
            console.error('Error fetching OCR status:', error);
        }
    };

    // โหลดข้อมูลจาก API เมื่อเริ่มต้น
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            Swal.fire({
                title: 'กำลังโหลด...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                await refreshFiles();
                await fetchOcrStatus();
                Swal.close();
            } catch (error) {
                // Error already handled in context
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const toggleDeleteStatus = async (file: FileItem) => {
        await deleteFileAction(file);
        setOpenMenuIndex(null);
    };

    const toggleRecommendStatus = async (file: FileItem) => {
        await recommendFileAction(file);
        setOpenMenuIndex(null);
    };

    // OCR All Files Handler
    const handleOcrAllFiles = async () => {
        const result = await Swal.fire({
            title: 'ยืนยันการ OCR ทุกไฟล์?',
            text: `จะทำ OCR ไฟล์ที่รอดำเนินการทั้งหมด ${ocrStatus.ocrPending} ไฟล์`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#A61919',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'เริ่ม OCR',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                setIsProcessingOcr(true);
                Swal.fire({
                    title: 'กำลังประมวลผล OCR...',
                    html: 'กรุณารอสักครู่ อาจใช้เวลาสักพัก',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const data = await fileService.ocrAllFiles();

                await fetchOcrStatus();
                await refreshFiles();

                Swal.fire({
                    icon: 'success',
                    title: 'OCR เสร็จสิ้น!',
                    html: `
                        <div class="text-left">
                            <p>ประมวลผลทั้งหมด: <strong>${data.total}</strong> ไฟล์</p>
                            <p style="color: #16a34a;">สำเร็จ: <strong>${data.results?.filter((r: any) => r.status === 'success').length || 0}</strong></p>
                            <p style="color: #ca8a04;">ข้าม: <strong>${data.results?.filter((r: any) => r.status === 'skipped').length || 0}</strong></p>
                            <p style="color: #dc2626;">ผิดพลาด: <strong>${data.results?.filter((r: any) => r.status === 'error').length || 0}</strong></p>
                        </div>
                    `,
                    confirmButtonColor: '#A61919',
                });

            } catch (error: any) {
                console.error('OCR error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: error?.response?.data?.message || 'ไม่สามารถทำ OCR ได้',
                });
            } finally {
                setIsProcessingOcr(false);
            }
        }
    };

    // OCR Single File Handler
    const handleOcrSingleFile = async (file: FileItem) => {
        if (!file.id) return;

        try {
            Swal.fire({
                title: 'กำลังประมวลผล OCR...',
                html: `ไฟล์: ${file.name}`,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const data = await fileService.ocrSingleFile(file.id);

            await fetchOcrStatus();
            await refreshFiles();

            Swal.fire({
                icon: 'info',
                title: 'อัปโหลด OCR',
                html: `
                    <div class="text-center">
                        <p><strong>${file.name}</strong></p>
                    </div>
                `,
                confirmButtonColor: '#A61919',
            });

        } catch (error: any) {
            console.error('OCR error:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error?.response?.data?.message || 'ไม่สามารถทำ OCR ได้',
            });
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadAndOcr = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // 1. Upload
            Swal.fire({
                title: 'กำลังอัปโหลด...',
                html: 'กรุณารอสักครู่',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const formData = new FormData();
            formData.append('file', file);

            const uploadRes = await fileService.uploadFile(formData);
            const fileId = uploadRes.fileId;

            await refreshFiles();

            // 2. Trigger OCR
            Swal.fire({
                title: 'กำลังประมวลผล OCR...',
                html: `ไฟล์: ${file.name}<br>กำลังส่งข้อมูลไปที่บริการ OCR...<br>ระบบจะทำการประมวลผลเบื้องหลัง`,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            // Start OCR
            await fileService.ocrSingleFile(fileId);

            // Fetch status immediately to see PENDING
            await fetchOcrStatus();
            await refreshFiles();

            Swal.fire({
                icon: 'success',
                title: 'ส่งเข้าคิว OCR แล้ว!',
                text: 'ระบบกำลังประมวลผล คุณสามารถดูสถานะได้ในรายการ',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error: any) {
            console.error('Upload & OCR error:', error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: error?.response?.data?.message || 'ไม่สามารถดำเนินการได้',
            });
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Get all files (flatten)
    const getAllFilesFlat = (items: FileItem[]): FileItem[] => {
        let results: FileItem[] = [];
        for (const item of items) {
            if (!item.delete_status && item.type === 'file') {
                results.push(item);
            }
            if (item.children) {
                results = [...results, ...getAllFilesFlat(item.children)];
            }
        }
        return results;
    };

    const allFiles = useMemo(() => getAllFilesFlat(files), [files]);

    const searchResults = useMemo(() => {
        if (!searchTerm) return allFiles;
        return allFiles.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, allFiles]);

    const sortedItems = useMemo(() => {
        const items = [...searchResults];
        if (sortBy === 'name') {
            return items.sort((a, b) => a.name.localeCompare(b.name, 'th'));
        }
        if (sortBy === 'date') {
            return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        if (sortBy === 'ocr_pending') {
            // Priority: UNPROCESSED > PENDING > FAILED > SUCCESS
            const priority = { 'UNPROCESSED': 0, 'PENDING': 1, 'FAILED': 2, 'SUCCESS': 3 };
            return items.sort((a, b) => {
                const pa = priority[a.ocr_status as keyof typeof priority] ?? 0;
                const pb = priority[b.ocr_status as keyof typeof priority] ?? 0;
                return pa - pb;
            });
        }
        if (sortBy === 'ocr_completed') {
            // Priority: SUCCESS > FAILED > PENDING > UNPROCESSED
            const priority = { 'SUCCESS': 0, 'FAILED': 1, 'PENDING': 2, 'UNPROCESSED': 3 };
            return items.sort((a, b) => {
                const pa = priority[a.ocr_status as keyof typeof priority] ?? 3;
                const pb = priority[b.ocr_status as keyof typeof priority] ?? 3;
                return pa - pb;
            });
        }
        return items;
    }, [searchResults, sortBy]);

    const progress = ocrStatus.totalFiles > 0 ? (ocrStatus.ocrCompleted / ocrStatus.totalFiles) * 100 : 0;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <PageHeader
                    name={nameuser}
                    onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    searchTerm={searchTerm}
                    onSearch={setSearchTerm}
                />

                {/* Content */}
                <main className="flex-1 px-2 md:px-4 lg:px-8 pt-4 md:pt-6 overflow-auto border border-gray-200 rounded-xl mx-2 md:mx-4 mb-2 md:mb-4 bg-white">

                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">OCR - แปลงรูปภาพเป็นข้อความ</h1>

                        {mounted && sortedItems.length > 0 && (
                            <div className="flex gap-1 md:gap-2">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-1.5 md:p-2 rounded ${viewMode === "grid" ? "text-red-600 bg-red-50" : "text-gray-600 hover:text-red-600 hover:bg-red-50"}`}
                                >
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-1.5 md:p-2 rounded ${viewMode === "list" ? "text-red-600 bg-red-50" : "text-gray-600 hover:text-red-600 hover:bg-red-50"}`}
                                >
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* OCR Status Card */}
                    <section className="mb-6 md:mb-8">
                        <div className="bg-gray-50/20 rounded-xl p-6 text-white border border-gray-200">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                {/* Left Side - Status Info */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="flex flex-col">
                                                    <div className="flex flex-row justify-between">
                                                        <h3 className="text-xl text-black font-bold">สถานะ OCR</h3>
                                                    </div>
                                                    <p className="text-black/80 text-sm">ระบบแปลงรูปภาพเป็นข้อความ</p>
                                                </div>

                                            </div>
                                        </div>

                                        {/* Right Side - Actions */}
                                        <div className="md:ml-6 flex flex-col md:flex-row gap-3">
                                            {ocrStatus.ocrUnprocessed > 0 && (
                                                <button
                                                    onClick={handleOcrAllFiles}
                                                    disabled={isProcessingOcr}
                                                    className="w-full md:w-auto px-6 py-3 bg-white text-[#A61919] rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {isProcessingOcr ? (
                                                        <>
                                                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                            กำลังประมวลผล...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            OCR ทั้งหมด ({ocrStatus.ocrUnprocessed} ไฟล์)
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center px-4 mt-6">
                                        {/* Total Files */}
                                        <div className="bg-gray-300/20 text-start rounded-lg p-3 border border-gray-200 h-full">
                                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="text-2xl text-black font-bold my-2">{ocrStatus.totalFiles}</div>
                                            <div className="text-xs text-black">ไฟล์ทั้งหมด</div>
                                        </div>

                                        {/* Success */}
                                        <div className="bg-green-500/20 text-start rounded-lg p-3 border border-gray-200 h-full">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="text-2xl text-black font-bold my-2">{ocrStatus.ocrCompleted}</div>
                                            <div className="text-xs text-black">เสร็จแล้ว</div>
                                        </div>

                                        {/* Processing */}
                                        <div className="bg-blue-500/20 text-start rounded-lg p-3 border border-gray-200 h-full">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </div>
                                            <div className="text-2xl text-black font-bold my-2">{ocrStatus.ocrProcessing}</div>
                                            <div className="text-xs text-black">กำลังทำ</div>
                                        </div>

                                        {/* Waiting/Unprocessed */}
                                        <div className="bg-yellow-500/20 text-start rounded-lg p-3 border border-gray-200 h-full">
                                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="text-2xl text-black font-bold my-2">{ocrStatus.ocrUnprocessed}</div>
                                            <div className="text-xs text-black">รอดำเนินการ</div>
                                        </div>

                                        {/* Failed */}
                                        <div className="bg-red-500/20 text-start rounded-lg p-3 border border-gray-200 h-full">
                                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                            <div className="text-2xl text-black font-bold my-2">{ocrStatus.ocrFailed}</div>
                                            <div className="text-xs text-black">ล้มเหลว</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Files Section */}
                    <section>
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                                {mounted ? (searchTerm ? `ผลการค้นหา "${searchTerm}" (${sortedItems.length})` : `ไฟล์ทั้งหมด (${sortedItems.length})`) : `ไฟล์ทั้งหมด (0)`}
                            </h2>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm border border-gray-300 rounded-md bg-white text-gray-700 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            >
                                <option value="default">เรียง (Default)</option>
                                <option value="name">ชื่อ</option>
                                <option value="date">วันที่ล่าสุด</option>
                                <option value="ocr_pending">รอ OCR ก่อน</option>
                                <option value="ocr_completed">OCR เสร็จก่อน</option>
                            </select>
                        </div>

                        {!mounted ? (
                            /* Loading State - Shown during SSR and initial client render */
                            <div className="flex flex-col items-center justify-center min-h-[400px] md:h-[calc(100vh-500px)]">
                                <div className="w-full max-w-[200px] md:max-w-[280px] h-auto mb-6 md:mb-8">
                                    <svg className="w-full h-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">กำลังโหลด...</h2>
                                <p className="text-sm text-gray-600 text-center max-w-md px-4 md:px-0">
                                    กรุณารอสักครู่
                                </p>
                            </div>
                        ) : sortedItems.length === 0 ? (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center min-h-[400px] md:h-[calc(100vh-500px)]">
                                <div className="w-full max-w-[200px] md:max-w-[280px] h-auto mb-6 md:mb-8">
                                    <svg className="w-full h-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">ไม่พบไฟล์ในระบบ</h2>
                                <p className="text-sm text-gray-600 text-center max-w-md px-4 md:px-0">
                                    กรุณาอัปโหลดไฟล์รูปภาพ (JPG, PNG, PDF) เพื่อใช้งาน OCR
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Grid View */}
                                {viewMode === "grid" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                        {sortedItems.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <FileCard
                                                    file={file}
                                                    isMenuOpen={openMenuIndex === index}
                                                    onToggleMenu={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuIndex(openMenuIndex === index ? null : index);
                                                    }}
                                                    onCloseMenu={() => setOpenMenuIndex(null)}
                                                    onNavigate={() => {
                                                        setPreviewFile(file);
                                                        setOpenMenuIndex(null);
                                                    }}
                                                    onMoveToTrash={() => toggleDeleteStatus(file)}
                                                    onToggleRecommend={() => toggleRecommendStatus(file)}
                                                />
                                                {/* OCR Status Badge */}
                                                <div className="absolute bottom-2 left-2 z-10">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm ${file.ocr_status === 'SUCCESS' ? 'bg-green-100 text-green-800 border border-green-200' :
                                                        file.ocr_status === 'PENDING' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                                            file.ocr_status === 'FAILED' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                                'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                        }`}>
                                                        {file.ocr_status === 'SUCCESS' ? '✓ OCR' :
                                                            file.ocr_status === 'PENDING' ? '⟳ กำลังทำ' :
                                                                file.ocr_status === 'FAILED' ? '✗ ล้มเหลว' :
                                                                    'รอดำเนินการ'}
                                                    </span>
                                                </div>
                                                {/* OCR Button */}
                                                {(file.ocr_status === 'UNPROCESSED' || file.ocr_status === 'FAILED') && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOcrSingleFile(file);
                                                        }}
                                                        className="absolute bottom-2 right-2 px-3 py-1.5 bg-gradient-to-r from-[#A61919] to-[#FF7B7B] text-white text-xs rounded-lg hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        {file.ocr_status === 'FAILED' ? 'ลองใหม่' : 'OCR'}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* List View */}
                                {viewMode === "list" && (
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                                        <table className="w-full min-w-[700px]">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ชื่อ</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">เจ้าของ</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">วันที่อัพโหลด</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">สถานะ OCR</th>
                                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">ดำเนินการ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {sortedItems.map((file, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 cursor-pointer" onClick={() => setPreviewFile(file)}>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                </div>
                                                                <span className="font-medium text-gray-900 truncate max-w-[200px]">{file.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{file.owner}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{file.date}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${file.ocr_status === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                                                                file.ocr_status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                                                                    file.ocr_status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {file.ocr_status === 'SUCCESS' ? (
                                                                    <>
                                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                        OCR เสร็จแล้ว
                                                                    </>
                                                                ) : file.ocr_status === 'PENDING' ? (
                                                                    <>
                                                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                        </svg>
                                                                        กำลังประมวลผล
                                                                    </>
                                                                ) : file.ocr_status === 'FAILED' ? (
                                                                    <>
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                        ล้มเหลว
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                        </svg>
                                                                        รอดำเนินการ
                                                                    </>
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {file.ocr_status === 'SUCCESS' ? (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOcrResultFile(file);
                                                                    }}
                                                                    className="px-4 py-1.5 bg-green-500 text-white text-sm rounded-lg font-medium hover:bg-green-600 transition-all duration-200 inline-flex items-center gap-1"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                    ดูผลลัพธ์
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (file.ocr_status !== 'PENDING') handleOcrSingleFile(file);
                                                                    }}
                                                                    disabled={file.ocr_status === 'PENDING'}
                                                                    className={`px-4 py-1.5 text-white text-sm rounded-lg font-medium transition-all duration-200 inline-flex items-center gap-1 ${file.ocr_status === 'PENDING'
                                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                                        : 'bg-gradient-to-r from-[#A61919] to-[#FF7B7B] hover:shadow-lg hover:scale-105'
                                                                        }`}
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                                    </svg>
                                                                    {file.ocr_status === 'FAILED' ? 'ลองใหม่' : 'OCR'}
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </main>
            </div>

            <FilePreviewModal
                file={previewFile}
                onClose={() => setPreviewFile(null)}
            />

            <OcrResultModal
                file={ocrResultFile}
                onClose={() => setOcrResultFile(null)}
            />
        </div >
    );
}
