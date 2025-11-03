import db from '../config/database.js';
import { info, error } from '../utils/logger.js';

/**
 * Memproses todos yang sudah melewati deadline.
 * - Menonaktifkan todo (status -> 'disabled')
 * - Mencatat riwayat ke tb_todo_history ('failed')
 * - Mengupdate statistik user (failed_times + 1)
 */
export async function checkDeadlines() {
  info('⏰ Checking todos that passed their deadline...');

  try {
    // Ambil semua todo aktif yang sudah melewati deadline
    const [todos] = await db.execute(`
      SELECT t.id, t.user_id, t.task_name, t.reminder_deadline
      FROM tb_todos t
      WHERE t.status = 'active'
        AND t.reminder_deadline IS NOT NULL
        AND t.reminder_deadline <= NOW()
    `);

    if (todos.length === 0) {
      info('✅ Tidak ada todo yang melewati deadline.');
      return;
    }

    info(`📋 Menemukan ${todos.length} todo yang melewati deadline.`);

    // Proses satu per satu agar kegagalan satu tidak menggagalkan semua
    for (const todo of todos) {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        // 1) Nonaktifkan todo agar tidak diproses ulang
        await conn.execute(
          `UPDATE tb_todos
             SET status = 'disabled'
           WHERE id = ?`,
          [todo.id]
        );

        // 2) Catat ke riwayat
        await conn.execute(
          `INSERT INTO tb_todo_history (todo_id, user_id, action_type, action_time, notes)
           VALUES (?, ?, 'failed', NOW(), ?)`,
          [todo.id, todo.user_id, `Deadline missed for task "${todo.task_name}"`]
        );

        // 3) Update statistik user
        await conn.execute(
          `UPDATE tb_user_statistics
              SET failed_times = failed_times + 1
            WHERE user_id = ?`,
          [todo.user_id]
        );

        await conn.commit();
        info(`❗️ TODO#${todo.id} dinonaktifkan: lewat deadline.`);
      } catch (err) {
        await conn.rollback();
        error(`❌ Gagal memproses deadline TODO#${todo.id}:`, err.message);

        // Catat error ke history agar tetap ter-trace
        try {
          await db.execute(
            `INSERT INTO tb_todo_history (todo_id, user_id, action_type, action_time, notes)
             VALUES (?, ?, 'failed', NOW(), ?)`,
            [todo.id, todo.user_id, `Processing error: ${err.message}`]
          );

          await db.execute(
            `UPDATE tb_user_statistics
                SET error_times = error_times + 1
              WHERE user_id = ?`,
            [todo.user_id]
          );
        } catch (logErr) {
          error(`⚠️ Gagal mencatat error untuk TODO#${todo.id}:`, logErr.message);
        }
      } finally {
        conn.release();
      }
    }

    info('✅ Pemrosesan deadline selesai.');
  } catch (err) {
    error('❌ Terjadi kesalahan saat memeriksa deadline:', err.message);
  }
}

export default { checkDeadlines };
