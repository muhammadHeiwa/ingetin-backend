import express from 'express';
import cors from 'cors';
import routes from '../routes/index.js';
import errorHandler from '../middlewares/errorHandler.js';
import { info } from '../utils/logger.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
);

// Error Handler
app.use(errorHandler);

// Export default app & named listen function
export const listen = (...args) => app.listen(...args);
export default app;
