import dotenv from 'dotenv';
import app from './src/config/app.js';
import { initCronJobs } from './src/config/cron.js';
import logger from './src/utils/logger.js';
import { startTelegramBot } from './src/integration/telegram.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  logger.info(`📡 API Base URL: http://localhost:${PORT}/api`);

  // Initialize cron jobs setelah server berjalan
  try {
    initCronJobs();
    await startTelegramBot(app);
    logger.info('⏰ Cron jobs initialized');
  } catch (error) {
    logger.error('Failed to initialize cron jobs:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

export default server;
