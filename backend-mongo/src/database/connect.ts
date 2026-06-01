import mongoose from 'mongoose';
import { logger } from '../logger/logger';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI is not defined');
    return;
  }

  // Disable global buffering so database operations fail fast instead of hanging when disconnected
  mongoose.set('bufferCommands', false);

  try {
    await mongoose.connect(uri, { 
      family: 4,
      serverSelectionTimeoutMS: 5000 // fail fast if Atlas is unreachable
    });
    logger.info('✅ Connected to MongoDB');
  } catch (error: any) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
  }
};
