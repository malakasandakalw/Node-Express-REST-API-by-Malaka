import mongoose from 'mongoose';
import config from './index';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongo.uri, {
      maxPoolSize: 10,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err: Error) => {
      console.error('MongoDB connection error:', err);
    });
  } catch (err) {
    console.error('MongoDB initial connection failed:', (err as Error).message);
    process.exit(1);
  }
};

export default connectDB;
