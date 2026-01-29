import { useState } from 'react';
import Swal from 'sweetalert2';
import { fileService } from '@/lib/services/file.service';
import { useNavigation } from '@/app/contexts/NavigationContext';
import { FileItem } from '@/app/types/file';

export const useFileActions = () => {
    const { refreshFiles } = useNavigation();

    const toggleDeleteStatus = async (val: FileItem) => {
        if (!val.id) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่พบข้อมูลไฟล์',
            });
            return;
        }

        const result = await Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "คุณต้องการย้ายไฟล์นี้ไปถังขยะใช่หรือไม่",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await fileService.updateFile(val.id, { deleteStatus: true });

                // Success feedback
                await Swal.fire({
                    icon: 'success',
                    title: 'ลบสำเร็จ!',
                    text: 'ไฟล์ถูกย้ายไปถังขยะแล้ว',
                    showConfirmButton: false,
                    timer: 1500
                });

                await refreshFiles();
            } catch (error: any) {
                console.error('Error deleting file:', error);
                const errorMessage = error?.response?.data?.message || 'ไม่สามารถลบไฟล์ได้';
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: errorMessage,
                });
            }
        }
    };

    const toggleRecommendStatus = async (val: FileItem) => {
        if (!val.id) {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่พบข้อมูลไฟล์',
            });
            return;
        }

        try {
            await fileService.updateFile(val.id, { recommendStatus: !val.recommend_status });

            await Swal.fire({
                icon: 'success',
                title: 'สำเร็จ',
                text: 'ปรับปรุงสถานะแนะนำเรียบร้อยแล้ว',
                showConfirmButton: false,
                timer: 1500
            });

            await refreshFiles();
        } catch (error: any) {
            console.error('Error updating file:', error);
            const errorMessage = error?.response?.data?.message || 'ไม่สามารถอัพเดทไฟล์ได้';
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: errorMessage,
            });
        }
    };

    const restoreFile = async (val: FileItem) => {
        if (!val.id) return;

        try {
            await fileService.updateFile(val.id, { deleteStatus: false });

            await Swal.fire({
                icon: 'success',
                title: 'กู้คืนสำเร็จ!',
                text: 'ไฟล์ถูกย้ายกลับไปยังที่เดิมแล้ว',
                showConfirmButton: false,
                timer: 1500
            });

            await refreshFiles();
        } catch (error: any) {
            console.error('Error restoring file:', error);
            const errorMessage = error?.response?.data?.message || 'ไม่สามารถกู้คืนไฟล์ได้';
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: errorMessage,
            });
        }
    };

    const deleteFilePermanently = async (val: FileItem) => {
        if (!val.id) return;

        const result = await Swal.fire({
            title: 'ลบถาวร?',
            text: "คุณจะกู้คืนไฟล์นี้ไม่ได้อีกต่อไป",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบถาวร',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await fileService.deleteFilePermanently(val.id);

                await Swal.fire({
                    icon: 'success',
                    title: 'ลบสำเร็จ!',
                    text: 'ไฟล์ถูกลบออกจากระบบอย่างถาวร',
                    showConfirmButton: false,
                    timer: 1500
                });

                await refreshFiles();
            } catch (error: any) {
                console.error('Error deleting file:', error);
                const errorMessage = error?.response?.data?.message || 'ไม่สามารถลบไฟล์ได้';
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: errorMessage,
                });
            }
        }
    };

    return {
        toggleDeleteStatus,
        toggleRecommendStatus,
        restoreFile,
        deleteFilePermanently
    };
};
