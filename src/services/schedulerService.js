import db from '../config/database.js';
import { info, error } from '../utils/logger.js';

/**
 * Memproses todos yang sudah melewati deadline.
 * - Mencatat riwayat ke tb_todo_history ('failed')
 * - Mengupdate statistik user (failed_times + 1)
 */
export async function checkDeadlines() {
  info('⏰ Checking todos that passed their deadline...');

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [dueTodos] = await conn.execute(`
      SELECT t.id, t.user_id, t.task_name, t.reminder_deadline
      FROM tb_todos t
      WHERE t.status = 'active'
        AND t.reminder_deadline IS NOT NULL
        AND t.reminder_deadline <= CURTIME()
        AND TIME_TO_SEC(CURTIME()) - TIME_TO_SEC(t.reminder_deadline) <= 90
        AND (t.last_progress_reset IS NULL OR t.last_progress_reset < CURDATE())
    `);

    if (dueTodos.length === 0) {
      info('✅ Tidak ada todo yang melewati deadline.');
      await conn.rollback();
      return;
    }

    info(`📋 Menemukan ${dueTodos.length} todo yang melewati deadline.`);

    // 1) Catat ke history: deadline missed + progress di-reset
    for (const todo of dueTodos) {
      await conn.execute(
        `UPDATE tb_todos
        SET failed_count = failed_count + 1
        WHERE id = ?`,
        [todo.id]
      );
     
      await conn.execute(
        `INSERT INTO tb_todo_history (todo_id, user_id, action_type, action_time, notes)
        VALUES (?, ?, 'failed', NOW(), 'Deadline ${todo.reminder_deadline} missed, progress reset')`,
        [todo.id, todo.user_id]
      );

      const [failCountRows] = await db.execute(
        `SELECT failed_count FROM tb_todos
          WHERE id = ?`,
        [todo.id]
      );
      const failCount = failCountRows[0]?.failed_count || 0;

      if (failCount >= 3) {
        await db.execute(
          `UPDATE tb_todos
          SET status = 'disabled'
          WHERE id = ?`,
          [todo.id]
        );

        await db.execute(
          `INSERT INTO tb_todo_history (todo_id, user_id, action_type, action_time, notes)
          VALUES (?, ?, 'disabled', NOW(), 'Todo disabled automatically after 3 failures')`,
          [todo.id, todo.user_id]
        );

        continue;
      }
    }

    // 2) Update statistik user (failed_times += jumlah todo due per user)
    await conn.execute(`
      UPDATE tb_user_statistics s
      JOIN (
        SELECT user_id, COUNT(*) AS cnt
        FROM tb_todos
        WHERE status = 'active'
          AND reminder_deadline IS NOT NULL
          AND reminder_deadline <= CURTIME()
          AND TIME_TO_SEC(CURTIME()) - TIME_TO_SEC(reminder_deadline) <= 90
          AND (last_progress_reset IS NULL OR last_progress_reset < CURDATE())
        GROUP BY user_id
      ) x ON x.user_id = s.user_id
      SET s.failed_times = s.failed_times + x.cnt
    `);

    // 3) Reset progress & is_reminded agar besok bisa diingatkan lagi
    await conn.execute(`
      UPDATE tb_todos
      SET task_progress = 'on progress',
          is_reminded = FALSE,
          last_progress_reset = CURDATE()
      WHERE status = 'active'
        AND reminder_deadline IS NOT NULL
        AND reminder_deadline <= CURTIME()
        AND TIME_TO_SEC(CURTIME()) - TIME_TO_SEC(reminder_deadline) <= 90
        AND (last_progress_reset IS NULL OR last_progress_reset < CURDATE())
    `);

    await conn.commit();
    info('✅ Pemrosesan deadline & reset progress selesai.');
  } catch (err) {
    await conn.rollback();
    error('❌ Terjadi kesalahan saat memeriksa deadline:', err.message);
  } finally {
    conn.release();
  }
}

export default { checkDeadlines };
