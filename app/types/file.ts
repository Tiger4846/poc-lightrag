export type FileItem = {
  id?: string; // เพิ่ม id สำหรับการอัพเดท
  name: string;
  owner: string;
  date: string;
  type: "folder" | "file";
  fileType?: "pdf" | "image" | "txt" | "doc";
  children?: FileItem[];
  recommend_status: boolean;
  delete_status: boolean;
  ocr_status: boolean;
  deleted_at: Date | null;
  createdAt: Date;
};
