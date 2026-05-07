import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import app, { startApp } from './app';
import { connectDB } from './database/connect';
import { logger } from './logger/logger';

const start = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start Server
    const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;
    await app.listen({ port, host: '0.0.0.0' });
    
    // 3. Initialize WebSocket
    await startApp();

    logger.info(`🚀 CatchMe AI Real-time Backend running at http://localhost:${port}`);
  } catch (err: any) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

start();
