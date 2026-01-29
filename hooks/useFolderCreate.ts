import { useState } from 'react';
import Swal from 'sweetalert2';
import { fileService } from '@/lib/services/file.service';
import { useNavigation } from '@/app/contexts/NavigationContext';

export const useFolderCreate = (onClose?: () => void) => {
    const [folderName, setFolderName] = useState("");
    const { currentFolderId, refreshFiles } = useNavigation();

    const handleCreateFolder = async () => {
        if (!folderName.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'กรุณาระบุชื่อโฟลเดอร์',
                text: 'โปรดกรอกชื่อโฟลเดอร์ที่ต้องการสร้าง',
                confirmButtonColor: '#d33'
            });
            return;
        }

        try {
            Swal.fire({
                title: 'กำลังสร้างโฟลเดอร์...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            await fileService.createFolder(folderName, currentFolderId);

            await Swal.fire({
                icon: 'success',
                title: 'สำเร็จ!',
                text: 'สร้างโฟลเดอร์เรียบร้อยแล้ว',
                showConfirmButton: false,
                timer: 1500
            });

            onClose?.();
            setFolderName("");
            await refreshFiles();

        } catch (error: any) {
            console.error("Create folder error:", error);
            const errorMessage = error?.response?.data?.message || 'ไม่สามารถสร้างโฟลเดอร์ได้ กรุณาลองใหม่อีกครั้ง';
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: errorMessage,
                confirmButtonColor: '#d33'
            });
        }
    };

    return {
        folderName,
        setFolderName,
        handleCreateFolder
    };
};
