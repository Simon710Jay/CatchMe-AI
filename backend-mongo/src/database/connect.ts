import mongoose from 'mongoose';
import { logger } from '../logger/logger';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI is not defined');
    return;
  }

  try {
    await mongoose.connect(uri, { family: 4 });
    logger.info('✅ Connected to MongoDB');
  } catch (error: any) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
  }
};
