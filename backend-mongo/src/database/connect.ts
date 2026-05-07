import mongoose from 'mongoose';
import { logger } from '../logger/logger';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    logger.info('✅ Successfully connected to MongoDB');
  } catch (error: any) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
