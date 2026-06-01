import IORedis from 'ioredis';
import { logger } from '../logger/logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    if (times > 5) {
      logger.warn('Redis connection failed multiple times. Suppressing further retry logs.');
    } else {
      logger.warn(`Redis connection refused. Retrying in 5 seconds (Attempt ${times})...`);
    }
    return Math.min(times * 1000, 5000); // Retry every 5 seconds instead of crashing
  }
});

redisConnection.on('error', (err) => {
  // Suppress verbose ECONNREFUSED logs to avoid spamming the console when Redis is offline
  if (err.message.includes('ECONNREFUSED')) return;
  logger.error(`Redis Error: ${err.message}`);
});
