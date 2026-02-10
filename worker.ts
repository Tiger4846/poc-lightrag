import { Worker } from 'bullmq';
import Redis from 'ioredis';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { PrismaClient } from './app/generated/prisma';

// Initialize Prisma
const prisma = new PrismaClient();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const OCR_SERVICE_URL = (process.env.OCR_SERVICE_URL?.replace(/\/+$/, '') || 'http://127.0.0.1:8001') + '/ocr';

console.log('🚀 Worker started, connecting to Redis at', redisUrl);

const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
});

// Helper to check OCR health with retry
async function ensureOCRServiceReady(retries = 10, delayMs = 3000): Promise<boolean> {
    const healthUrl = `${OCR_SERVICE_URL.replace('/ocr', '')}/health`; // http://127.0.0.1:8001/health

    for (let i = 0; i < retries; i++) {
        try {
            await axios.get(healthUrl, { timeout: 2000 });
            return true;
        } catch (err: any) {
            console.log(`[OCR Check] Service not ready yet (Attempt ${i + 1}/${retries}). Waiting...`);
            await new Promise(res => setTimeout(res, delayMs));
        }
    }
    return false;
}

const worker = new Worker(
    'ocr-queue',
    async (job) => {
        console.log(`[Job ${job.id}] 🔄 Processing OCR for File ID: ${job.data.fileId}`);

        // Check if OCR Service is up
        const isReady = await ensureOCRServiceReady();
        if (!isReady) {
            throw new Error(`OCR Service at ${OCR_SERVICE_URL} is not responding after multiple attempts.`);
        }

        const { fileId, filePath, fileName } = job.data;
        const startTime = Date.now();

        try {
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }

            // 1. Send file to Python OCR Service
            const form = new FormData();
            form.append('file', fs.createReadStream(filePath), fileName);

            console.log(`[Job ${job.id}] 📤 Sending to OCR Service: ${OCR_SERVICE_URL}`);
            const response = await axios.post(OCR_SERVICE_URL, form, {
                headers: {
                    ...form.getHeaders(),
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 600000, // 10 minutes timeout
            });

            const { markdown, success, error, page_count } = response.data;

            if (!success || !markdown) {
                throw new Error(error || 'OCR Service returned failure');
            }

            console.log(`[Job ${job.id}] ✅ OCR Success, markdown length: ${markdown.length}, pages: ${page_count}`);

            // 2. Save Markdown file
            const markdownDir = path.join(process.cwd(), 'markdown');
            if (!fs.existsSync(markdownDir)) {
                fs.mkdirSync(markdownDir, { recursive: true });
            }

            const safeName = path.parse(fileName).name.replace(/[^a-z0-9\u0E00-\u0E7F]/gi, '_');
            const markdownFileName = `${safeName}.md`;
            const markdownPath = path.join(markdownDir, markdownFileName);

            fs.writeFileSync(markdownPath, markdown);
            console.log(`[Job ${job.id}] 💾 Saved markdown to: ${markdownPath}`);

            // 3. Update Database
            await prisma.fileNode.update({
                where: { id: fileId },
                data: {
                    ocrStatus: 'SUCCESS',
                    markdownPath: `markdown/${markdownFileName}`,
                },
            });

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`[Job ${job.id}] 🎉 Completed in ${duration}s`);

            return { success: true, markdownPath };

        } catch (error) {
            console.error(`[Job ${job.id}] ❌ Failed:`, error);
            throw error; // Rethrow to let BullMQ handle retries
        }
    },
    {
        connection,
        concurrency: 1, // Process 1 file at a time to avoid overloading OCR
    }
);

worker.on('completed', (job) => {
    console.log(`[Job ${job?.id}] Completed successfully`);
});

worker.on('failed', (job, err) => {
    console.error(`[Job ${job?.id}] Failed with error ${err.message}`);
});

console.log('👷 OCR Worker is ready and listening for jobs...');
