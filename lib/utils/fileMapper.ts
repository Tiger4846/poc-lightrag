import { FileItem } from "@/app/types/file";

interface FileNodeFromAPI {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  size: number | null;
  storageKey: string | null;
  createdAt: string;
  userId: string | null;
  recommendStatus: boolean;
  deleteStatus: boolean;
  deletedAt: string | null;
  user?: {
    name: string | null;
    email: string;
  } | null;
}


//  แปลง extension ของไฟล์เป็นประเภทไฟล์
function getFileType(fileName: string): "pdf" | "image" | "txt" | "doc" | undefined {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) return undefined;

  if (extension === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension)) return "image";
  if (extension === "txt") return "txt";
  if (["doc", "docx"].includes(extension)) return "doc";

  return undefined;
}

//  แปลงวันที่เป็นรูปแบบไทย  
function formatThaiDate(dateString: string): string {
  const date = new Date(dateString);
  const thaiMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;

  return `${day} ${month} ${year}`;
}

// แปลง FileNode จาก API เป็น FileItem

function convertToFileItem(node: FileNodeFromAPI): FileItem & { id: string } {
  return {
    id: node.id,
    name: node.name,
    owner: node.user?.name || node.user?.email || "Unknown",
    date: formatThaiDate(node.createdAt),
    type: node.type.toLowerCase() as "folder" | "file",
    fileType: node.type === "FILE" ? getFileType(node.name) : undefined,
    recommend_status: node.recommendStatus,
    delete_status: node.deleteStatus,
    deleted_at: node.deletedAt ? new Date(node.deletedAt) : null,
    createdAt: new Date(node.createdAt),
    children: [],
  };
}


export function buildFileTree(fileNodes: FileNodeFromAPI[]): FileItem[] {
  // แปลงทุก node เป็น FileItem พร้อม id
  const itemMap = new Map<string, FileItem & { id: string }>();

  fileNodes.forEach(node => {
    itemMap.set(node.id, convertToFileItem(node));
  });

  // สร้างโครงสร้างต้นไม้
  const rootItems: FileItem[] = [];

  // ทำต้นไม้เพื่อหา parent-child relationship ทำให้รู้ว่าไฟล์ไหนอยู่ภายใต้โฟลเดอร์ไหน
  fileNodes.forEach(node => {
    const item = itemMap.get(node.id);
    if (!item) return;

    if (node.parentId === null) {
      // ไม่มี parent = root level
      rootItems.push(item);
    } else {
      // มี parent = ต้องเพิ่มเข้าไปใน children ของ parent
      const parent = itemMap.get(node.parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(item);
      } else {
        // ถ้าหา parent ไม่เจอ ให้ถือว่าเป็น root
        rootItems.push(item);
      }
    }
  });

  return rootItems;
}

// เอาไว้หา Path ของไฟล์
export function findFileById(
  items: FileItem[],
  fileId: string,
  currentPath: string[] = []
): { item: FileItem; path: string[] } | null {

  for (const item of items) {

    const itemWithId = item as FileItem & { id?: string };

    if (itemWithId.id === fileId) {
      return { item, path: [...currentPath, item.name] };
    }

    if (item.children) {
      const found = findFileById(item.children, fileId, [...currentPath, item.name]);
      if (found) return found;
    }
  }

  return null;
}
