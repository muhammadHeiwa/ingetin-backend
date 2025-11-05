import express from 'express';
import * as TodoController from '../controllers/todoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Semua route memerlukan autentikasi
router.use(authMiddleware);

// Create todo
router.post('/', TodoController.createTodo);

// Get all todos
router.get('/', TodoController.getAllTodos);

// Get todo by ID
router.get('/:id', TodoController.getTodoById);

// Update todo
router.put('/:id', TodoController.updateTodo);

// Update todo status
router.patch('/status/:id', TodoController.updateTodoStatus);

// Delete todo
router.delete('/:id', TodoController.deleteTodo);

export default router;