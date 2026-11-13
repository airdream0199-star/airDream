const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Warm up the in-memory cache from Mongo on first connect
    // We require here (after Mongo is connected) so models are registered first
    setTimeout(() => {
      try {
        const store = require('../utils/dataStore');
        store.loadFromMongo().then(() => {
          console.log('[DataStore] In-memory cache loaded from MongoDB');
        }).catch(err => {
          console.warn('[DataStore] Cache load warning:', err.message);
        });
      } catch (e) {
        console.warn('[DataStore] loadFromMongo init error:', e.message);
      }
    }, 500);

  } catch (error) {
    console.warn(
      `[Database Warning] MongoDB connection failed: ${error.message}. Running in offline fallback mode.`
    );
    isConnected = false;
  }

  // Auto-reconnect on disconnect
  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected. Will retry on next request.');
    isConnected = false;
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Reconnected!');
    isConnected = true;
    // Reload cache after reconnection
    try {
      const store = require('../utils/dataStore');
      store.loadFromMongo().catch(() => {});
    } catch (e) {}
  });
};

module.exports = connectDB;
