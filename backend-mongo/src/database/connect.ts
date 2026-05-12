import mongoose from 'mongoose';
import { logger } from '../logger/logger';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI is not defined in environment variables');
    return;
  }

  console.log(`URI found: ${uri.substring(0, 20)}...`);

  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(uri);
    console.log('✅ Successfully connected to MongoDB');
    logger.info('✅ Successfully connected to MongoDB');
  } catch (error: any) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
  }
};
