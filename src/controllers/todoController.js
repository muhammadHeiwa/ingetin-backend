import Todo from '../models/Todo.js';

/**
 * Membuat todo baru
 */
export async function createTodo(req, res) {
    try {
        const { task_name, description, status, reminderTime, reminderDeadline } = req.body;
        const userId = req.user.id;

        // Validasi input
        if (!task_name) {
            return res.status(400).json({ message: 'Task name is required' });
        }
        if (!reminderDeadline) {
            return res.status(400).json({ message: 'Reminder deadline is required' });
        }

        // Cek maksimal todo per user free
        const todoCount = await Todo.maxTodosPerUser(userId);
        if (todoCount >= 3) {
            return res.status(400).json({ message: 'Kamu sudah mencapai batas maksimal Reminder' });
        }

        const todoId = await Todo.create({
            task_name,
            description,
            status: status || 'disabled',
            userId,
            reminderTime,
            reminderDeadline
        });

        res.status(201).json({ 
            message: 'Berhasil dibuat! Nanti kami ingetin ya :)', 
            todoId 
        });
    } catch (error) {
        res.status(500).json({ message: 'Maaf ada error, akan segera kami perbaiki', error: error.message });
    }
}

/**
 * Mendapatkan semua todo milik user
 */
export async function getAllTodos(req, res) {
    try {
        const userId = req.user.id;
        const todos = await Todo.findAll(userId);

        res.status(200).json({ todos });
    } catch (error) {
        res.status(500).json({ message: 'Maaf ada error, akan segera kami perbaiki', error: error.message });
    }
}

/**
 * Mendapatkan todo berdasarkan ID
 */
export async function getTodoById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const todo = await Todo.findOne(id, userId);

        if (!todo) {
            return res.status(404).json({ message: 'Reminder yang kamu pilih tidak ditemukan' });
        }

        res.status(200).json({ todo });
    } catch (error) {
        res.status(500).json({ message: 'Maaf ada error, akan segera kami perbaiki', error: error.message });
    }
}

/**
 * Update todo
 */
export async function updateTodo(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updateData = req.body;

        // Verifikasi todo milik user
        const todo = await Todo.findOne(id, userId);
        if (!todo || todo.user_id !== userId) {
            return res.status(404).json({ message: 'Reminder yang kamu pilih tidak ditemukan' });
        }

        const updated = await Todo.update(id, updateData);

        if (!updated) {
            return res.status(400).json({ message: 'Gagal memperbarui Reminder' });
        }

        res.status(200).json({ message: 'Berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Maaf ada error, akan segera kami perbaiki', error: error.message });
    }
}

/**
 * Update status todo
 */
export async function updateTodoStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        if (!status) {
            return res.status(400).json({ message: 'Form belum lengkap' });
        }

        // Verifikasi todo milik user
        const todo = await Todo.findOne(id, userId);
        if (!todo || todo.user_id !== userId) {
            return res.status(404).json({ message: 'Reminder yang kamu pilih tidak ditemukan' });
        }

        const updated = await Todo.updateStatus(id, status);

        if (!updated) {
            return res.status(400).json({ message: 'Gagal memperbarui status' });
        }

        res.status(200).json({ message: 'Status berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Maaf ada error, akan segera kami perbaiki', error: error.message });
    }
}

/**
 * Update todo task done
 */
export async function updateTodoTaskDone(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verifikasi todo milik user
        const todo = await Todo.findOne(id, userId);
        if (!todo || todo.user_id !== userId) {
            return res.status(404).json({ message: 'Reminder yang kamu pilih tidak ditemukan' });
        }

        const updated = await Todo.updateTaskDone(id);

        if (!updated) {
            return res.status(400).json({ message: 'Gagal memperbarui status' });
        }

        res.status(200).json({ message: 'Status berhasil diperbarui' });
    } catch (error) {
        res.status(500).json({ message: 'Maaf ada error, akan segera kami perbaiki', error: error.message });
    }
}

/**
 * Delete todo
 */
export async function deleteTodo(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verifikasi todo milik user
        const todo = await Todo.findOne(id, userId);
        if (!todo || todo.user_id !== userId) {
            return res.status(404).json({ message: 'Reminder yang kamu pilih tidak ditemukan' });
        }

        const deleted = await Todo.delete(id);

        if (!deleted) {
            return res.status(400).json({ message: 'Gagal dihapus, silahkan coba lagi' });
        }

        res.status(200).json({ message: 'Reminder sudah dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Maaf ada error, akan segera kami perbaiki', error: error.message });
    }
}

export default {
    createTodo,
    getAllTodos,
    getTodoById,
    updateTodo,
    updateTodoStatus,
    deleteTodo
};