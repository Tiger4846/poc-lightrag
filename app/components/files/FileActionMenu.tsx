"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FileItem } from "@/app/types/file";

interface FileActionMenuProps {
    file: FileItem;
    isOpen: boolean;
    onClose: () => void;
    onMoveToTrash: () => void;
    onToggleRecommend: () => void;
    isTrash?: boolean;
    onRestore?: () => void;
    onDeletePermanently?: () => void;
    onUploadToLightRag?: () => void;
    onDeleteFromLightRag?: () => void;
    triggerRef: React.RefObject<HTMLElement>;
}

export default function FileActionMenu({
    file,
    isOpen,
    onClose,
    onMoveToTrash,
    onToggleRecommend,
    isTrash,
    onRestore,
    onDeletePermanently,
    onUploadToLightRag,
    onDeleteFromLightRag,
    triggerRef,
}: FileActionMenuProps) {
    const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const updatePosition = () => {
                if (!triggerRef.current) return;
                const rect = triggerRef.current.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + 4,
                    right: window.innerWidth - rect.right,
                });
            };

            updatePosition();

            // Close on scroll or resize to prevent menu floating detached
            window.addEventListener('scroll', onClose, true);
            window.addEventListener('resize', onClose);

            return () => {
                window.removeEventListener('scroll', onClose, true);
                window.removeEventListener('resize', onClose);
            };
        }
    }, [isOpen, triggerRef, onClose]);

    if (!isOpen || !position) return null;

    // Use portal to break out of overflow:hidden containers
    if (typeof document === 'undefined') return null;

    return createPortal(
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            />
            <div
                className="fixed z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200"
                style={{ top: position.top, right: position.right }}
            >
                <div className="py-1">
                    {isTrash ? (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRestore?.();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors text-left"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                <span className="text-sm">กู้คืน</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeletePermanently?.();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                                <span className="text-sm">ลบถาวร</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveToTrash();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                                <span className="text-sm">ย้ายไปถังขยะ</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleRecommend();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                    />
                                </svg>
                                <span className="text-sm">
                                    {file.recommend_status
                                        ? "ยกเลิกแนะนำ"
                                        : "เพิ่มไฟล์ไปแนะนำ"}
                                </span>
                            </button>
                            {onUploadToLightRag && onDeleteFromLightRag && (
                                file.lightrag_status === 'UPLOADED' ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteFromLightRag();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="text-sm">Delete from LightRAG</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUploadToLightRag();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        <span className="text-sm">Upload to LightRAG</span>
                                    </button>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}
