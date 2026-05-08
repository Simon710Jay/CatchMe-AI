import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const aiQueue = new Queue('ai-analysis', {
  connection: redisConnection,
});

export const queueAIAnalysis = async (incidentId: string) => {
  await aiQueue.add('analyze', { incidentId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
};
