import { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import { fileService } from '@/lib/services/file.service';
import { useNavigation } from '@/app/contexts/NavigationContext';

export const useFileUpload = (onClose?: () => void) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const { currentFolderId, refreshFiles } = useNavigation();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'กรุณาเลือกไฟล์',
                text: 'โปรดเลือกไฟล์ที่ต้องการจะอัปโหลด',
                confirmButtonColor: '#d33'
            });
            return;
        }

        try {
            let successCount = 0;
            let failCount = 0;

            Swal.fire({
                title: 'กำลังอัปโหลด...',
                html: `กำลังดำเนินการ 0/${selectedFiles.length}`,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const formData = new FormData();
                formData.append("file", file);
                formData.append("parentId", currentFolderId || "");

                try {
                    Swal.update({
                        html: `กำลังดำเนินการ ${i + 1}/${selectedFiles.length}<br/>${file.name}`
                    });

                    await fileService.uploadFile(formData);
                    successCount++;
                } catch (error) {
                    console.error(`Error uploading ${file.name}:`, error);
                    failCount++;
                }
            }

            if (successCount === selectedFiles.length) {
                await Swal.fire({
                    icon: 'success',
                    title: 'อัปโหลดสำเร็จ!',
                    text: `อัปโหลดแล้ว ${successCount} ไฟล์`,
                    showConfirmButton: false,
                    timer: 1500
                });

                onClose?.();
                setSelectedFiles([]);
                await refreshFiles();

            } else {
                await Swal.fire({
                    icon: 'warning',
                    title: 'เสร็จสิ้น',
                    text: `สำเร็จ ${successCount} ไฟล์, ล้มเหลว ${failCount} ไฟล์`,
                    confirmButtonColor: '#d33'
                });

                onClose?.();
                setSelectedFiles([]);
                await refreshFiles();
            }

        } catch (error) {
            console.error("Upload error:", error);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง',
                confirmButtonColor: '#d33'
            });
        }
    };

    return {
        selectedFiles,
        handleFileSelect,
        removeFile,
        handleUpload,
        setSelectedFiles
    };
};
