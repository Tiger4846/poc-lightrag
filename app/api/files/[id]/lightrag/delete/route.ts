import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/prisma";
import { getUserIdFromRequest } from "@/lib/auth/jwt";
import api from "@/lib/axios";

// Hardcoded based on request and existing LightRAG config
const LIGHTRAG_API_BASE = process.env.LIGHTRAG_API_URL || "http://localhost:9621";
const LIGHTRAG_API_KEY = process.env.LIGHTRAG_API_KEY;

// URLs
const LIGHTRAG_DELETE_URL = LIGHTRAG_API_BASE.endsWith('/documents/delete_document')
    ? LIGHTRAG_API_BASE
    : `${LIGHTRAG_API_BASE.replace(/\/$/, '')}/documents/delete_document`;

const LIGHTRAG_PAGINATED_URL = `${LIGHTRAG_API_BASE.replace(/\/$/, '')}/documents/paginated`;

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json(
                { message: "Unauthorized - Please login first" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Get the file
        const file = await prisma.fileNode.findUnique({
            where: { id },
        });

        if (!file) {
            return NextResponse.json(
                { message: "File not found" },
                { status: 404 }
            );
        }

        if (file.lightragStatus !== 'UPLOADED') {
            return NextResponse.json(
                { message: "ไฟล์นี้ยังไม่ได้ถูกเพิ่มเข้าคลังเอกสาร" },
                { status: 400 }
            );
        }

        let docId = file.lightragDocId;

        // If docId is missing, try to find it from LightRAG
        if (!docId) {
            try {
                // Search by filename or something unique?
                // The user said: "find docID from /documents/paginated"
                // But paginated returns a list. We need to filter.
                // Assuming we can match by file_path which might be the filename we sent.
                // We sent `uploadFileName` which was `file.name` or `file.id`.

                // Let's search all documents (or use a filter if supported)
                // The user provided example body: { "status_filter": "PROCESSED" }
                // Let's try to fetch recent documents and find a match.
                // Note: This might be inefficient if there are many documents.

                const searchResponse = await api.post(LIGHTRAG_PAGINATED_URL, {
                    page: 1,
                    page_size: 100, // Fetch top 100
                    sort_direction: "desc",
                    sort_field: "updated_at",
                    // status_filter: "PROCESSED" // Optional?
                }, {
                    headers: {
                        'X-API-Key': LIGHTRAG_API_KEY,
                    }
                });

                const documents = searchResponse.data.documents || [];
                // Try to find a match. We used file.name or file.id or markdown filename as upload name.
                // Best guess is to match file_path with what we likely sent.
                // We sent `uploadFileName` which was `path.basename(filePath)`.
                // If OCR was involved, it was `safeName.md`.

                // Let's try to match by partial name or exact match if possible.
                // This is a bit heuristic.

                const targetName = file.markdownPath ? file.markdownPath.split('/').pop() : file.name;

                const matchedDoc = documents.find((doc: any) => doc.file_path && doc.file_path.includes(targetName));

                if (matchedDoc) {
                    docId = matchedDoc.id;
                    console.log(`Found missing docId for file ${file.id}: ${docId}`);
                }

            } catch (searchError) {
                console.error("Error searching for docId:", searchError);
            }
        }

        if (!docId) {
            return NextResponse.json(
                { message: "ไม่พบรหัสเอกสาร อาจถูกลบไปแล้ว" },
                { status: 404 }
            );
        }

        // Prepare delete request
        try {
            const deleteResponse = await api.delete(LIGHTRAG_DELETE_URL, {
                data: {
                    doc_ids: [docId],
                    delete_file: true,
                    delete_llm_cache: true
                },
                headers: {
                    'X-API-Key': LIGHTRAG_API_KEY,
                }
            });

            const { status, message } = deleteResponse.data;

            if (status === 'busy') {
                return NextResponse.json(
                    { message: "ระบบกำลังประมวลผลอยู่: " + message },
                    { status: 503 } // Service Unavailable/Busy
                );
            }

            if (status === 'deletion_started' || status === 'success') {
                // Update DB to clear status
                await prisma.fileNode.update({
                    where: { id: file.id },
                    data: {
                        lightragStatus: 'NONE',
                        lightragDocId: null
                    }
                });

                return NextResponse.json({
                    message: "Deletion initiated successfully",
                    data: deleteResponse.data
                }, { status: 200 });
            }

            // Fallback
            return NextResponse.json({
                message: "ได้รับผลลัพธ์ที่ไม่คาดคิดจากการลบเอกสาร",
                data: deleteResponse.data
            }, { status: 500 });


        } catch (error: any) {
            console.error("LightRAG Delete API error:", error?.response?.data || error.message);
            return NextResponse.json(
                {
                    message: "ไม่สามารถลบไฟล์ออกจากคลังเอกสารได้",
                    error: error?.response?.data || error.message
                },
                { status: error?.response?.status || 500 }
            );
        }

    } catch (error: any) {
        console.error("LightRAG delete route error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
