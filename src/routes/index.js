import express from 'express';
import authRoutes from './authRoutes.js';
import todoRoutes from './todoRoutes.js';

const router = express.Router();

// API Info - endpoint utama
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Todo Reminder API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      todos: '/api/reminder',
      stats: '/api/stats (coming soon)',
    },
  });
});

// Import routes dengan error handling
try {
  router.use('/auth', authRoutes);
  router.use('/reminder', todoRoutes);
} catch (error) {
  console.error('Error loading auth routes:', error.message);
}

// Statistics routes (akan dibuat nanti)
// import statsRoutes from './statsRoutes.js';
// router.use('/stats', statsRoutes);

export default router;
