import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  serverUrl: process.env.CATCHME_SERVER_URL || 'http://localhost:3001',
  apiKey: process.env.CATCHME_API_KEY || '',
  serviceName: process.env.SERVICE_NAME || 'unknown-service',
  logFilePath: process.env.LOG_FILE_PATH || './app.log',
  pollInterval: parseInt(process.env.POLL_INTERVAL || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
};

if (!config.apiKey) {
  console.error('❌ CATCHME_API_KEY is required in environment variables');
  process.exit(1);
}
