const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongo.uri, {
      maxPoolSize: 10,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
  } catch (err) {
    console.error('MongoDB initial connection failed:', err.message);
    process.exit(1); // fail fast — no point running without DB
  }
};

module.exports = connectDB;
