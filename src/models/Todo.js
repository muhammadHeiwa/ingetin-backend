import db from '../config/database.js';
class Todo {
    /**
     * Membuat todo baru
     */
    static async create({ task_name, description, userId, reminderTime, reminderDeadline }) {
        const [result] = await db.execute(
            'INSERT INTO tb_todos (task_name, description, user_id, reminder_time, reminder_deadline, status) VALUES (?, ?, ?, ?, ?, ?)',
            [task_name, description, userId, reminderTime, reminderDeadline, 'active']
        );
        return result.insertId;
    }

    /**
     * Cari todo berdasarkan id atau user
     */
    static async findOne(id, userId) {
        const [rows] = await db.execute(
            'SELECT * FROM tb_todos WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return rows[0];
    }

  
    /**
     * Cari semua todo dengan opsional userId
     */
    static async findAll(userId = null) {
        if (userId) {
            const [rows] = await db.execute('SELECT * FROM tb_todos WHERE user_id = ?', [userId]);
            return rows;
        }
        const [rows] = await db.execute('SELECT * FROM tb_todos');
        return rows;
    }

    /**
     * Update todos data
     */
    static async update(id, data) {
        const fields = [];
        const values = [];

        if (data.task_name) {
            fields.push('task_name = ?');
            values.push(data.task_name);
        }

        if (data.description) {
            fields.push('description = ?');
            values.push(data.description);
        }

        if (data.reminder_time) {
            fields.push('reminder_time = ?');
            values.push(data.reminder_time);
        }
        if (data.reminder_deadline) {
            fields.push('reminder_deadline = ?');
            values.push(data.reminder_deadline);
        }

        if (fields.length === 0) {
        throw new Error('No fields to update');
        }

        values.push(id);

        const [result] = await db.execute(
            `UPDATE tb_todos SET ${fields.join(', ')} WHERE id = ?`, values
        );

        return result.affectedRows > 0;
    }

    /**
     * Update todos status
     */
    static async updateStatus(id, status) {
        const [result] = await db.execute(
            'UPDATE tb_todos SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Delete todos
     */
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM tb_todos WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    /**
     * Cek maksimal todo per user
     */
    static async maxTodosPerUser(userId) {
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM tb_todos WHERE user_id = ?', [userId]);
        return rows[0].count;
    }
}

export default Todo;
