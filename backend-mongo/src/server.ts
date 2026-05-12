import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import app, { startApp } from './app';
import { connectDB } from './database/connect';
import { logger } from './logger/logger';

const start = async () => {
  logger.info('🚀 Starting CatchMe AI Backend...');
  
  const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;

  try {
    // 1. Start Server First (so it doesn't block on DB)
    const address = await app.listen({ port, host: '0.0.0.0' });
    logger.info(`🌐 Server listening at ${address}`);
    
    // 2. Initialize WebSocket & Background Services
    await startApp();

    // 3. Connect to Database (Non-blocking)
    connectDB().catch(err => {
      logger.error(`⚠️ Continued without initial MongoDB connection: ${err.message}`);
    });

  } catch (err: any) {
    logger.error(`❌ Critical failure during startup: ${err.message}`);
    process.exit(1);
  }
};

start();
