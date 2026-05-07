import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Queue for processing logs (AI analysis, webhooks, etc)
export const logQueue = new Queue('log-processing', { connection });

export const addLogToQueue = async (incidentId: string, type: 'AI_ANALYSIS' | 'GITHUB_AUTOMATION') => {
  await logQueue.add(type, { incidentId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
};
