import express from 'express';
import authRoutes from './authRoutes.js';

const router = express.Router();

// API Info - endpoint utama
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Todo Reminder API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      todos: '/api/todos (coming soon)',
      stats: '/api/stats (coming soon)',
    },
  });
});

// Import routes dengan error handling
try {
  router.use('/auth', authRoutes);
} catch (error) {
  console.error('Error loading auth routes:', error.message);
}

// Todo routes (akan dibuat nanti)
// import todoRoutes from './todoRoutes.js';
// router.use('/todos', todoRoutes);

// Statistics routes (akan dibuat nanti)
// import statsRoutes from './statsRoutes.js';
// router.use('/stats', statsRoutes);

export default router;
