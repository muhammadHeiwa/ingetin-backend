import db from '../config/database.js';
import { info, error } from '../utils/logger.js';

/**
 * Mengecek dan mengirim reminder untuk todos yang waktunya sudah tiba.
 * Dipanggil oleh cron job setiap beberapa menit.
 */
export async function checkAndSendReminders() {
  info('🔔 Checking for todos that need reminders...');

  try {
    // Ambil semua todo yang aktif, belum diingatkan, dan waktu reminder sudah lewat
    const [todos] = await db.execute(`
      SELECT t.id, t.user_id, t.task_name, t.description, t.reminder_time
      FROM tb_todos t
      WHERE t.status = 'active'
        AND t.is_reminded = FALSE
        AND t.reminder_time IS NOT NULL
        AND t.reminder_time <= NOW()
    `);

    if (todos.length === 0) {
      info('✅ Tidak ada todo yang perlu diingatkan saat ini.');
      return;
    }

    info(`📋 Menemukan ${todos.length} todo untuk diingatkan.`);

    // Proses setiap todo
    for (const todo of todos) {
      try {
        // TODO: kirim notifikasi ke user (misalnya via email, bot, dll)
        // Contoh sementara: hanya log ke console
        info(`🔔 Reminder untuk user ${todo.user_id}: "${todo.task_name}"`);

        // Tandai todo sudah diingatkan
        await db.execute(
          `UPDATE tb_todos SET is_reminded = TRUE WHERE id = ?`,
          [todo.id]
        );

        // Simpan ke riwayat
        await db.execute(
          `INSERT INTO tb_todo_history (todo_id, user_id, action_type, action_time, notes)
           VALUES (?, ?, 'reminder_sent', NOW(), ?)`,
          [todo.id, todo.user_id, `Reminder sent for task "${todo.task_name}"`]
        );
      } catch (err) {
        error(`❌ Gagal memproses reminder untuk todo ${todo.id}:`, err.message);

        // Simpan ke riwayat error
        await db.execute(
          `INSERT INTO tb_todo_history (todo_id, user_id, action_type, action_time, notes)
           VALUES (?, ?, 'failed', NOW(), ?)`,
          [todo.id, todo.user_id, err.message]
        );
      }
    }

    info('✅ Semua reminder yang due telah diproses.');
  } catch (err) {
    error('❌ Terjadi kesalahan saat memeriksa reminder:', err.message);
  }
}

export default { checkAndSendReminders };
