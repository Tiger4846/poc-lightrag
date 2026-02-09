import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Redis connection for Queue
const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
});

// Create the Queue
export const ocrQueue = new Queue('ocr-queue', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false, // Keep failed jobs for inspection
    },
});
