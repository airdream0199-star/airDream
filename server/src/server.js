const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

let server;

async function startServer() {
  try {
    // Explicitly connect to MongoDB on startup
    await connectDB();

    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Air Dream Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`[API v1 Base] http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error(`[Startup Error] Could not start server: ${error.message}`);
    process.exit(1);
  }
}

// Graceful shutdown
const handleExit = (signal) => {
  console.log(`\n[Server] Received ${signal}. Closing HTTP server...`);
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed gracefully.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => handleExit('SIGINT'));
process.on('SIGTERM', () => handleExit('SIGTERM'));

// Only listen if not in a Vercel serverless environment
if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;
