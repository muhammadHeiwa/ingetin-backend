import db from '../config/database.js';
import { info, error } from '../utils/logger.js';
import { sendTelegramMessage } from '../integration/telegram.js';

/**
 * Mengecek dan mengirim reminder untuk todos yang waktunya sudah tiba.
 * Dipanggil oleh cron job setiap beberapa menit.
 */
export async function checkAndSendReminders() {
  info('🔔 Checking for todos that need reminders...');

  try {
    // Ambil semua todo yang aktif, belum diingatkan, dan waktu reminder sudah lewat
    const [todos] = await db.execute(`
      SELECT
        t.id,
        t.user_id,
        t.task_name,
        t.description,
        t.reminder_time,
        u.telegram_chat_id,
        u.telegram_username
      FROM tb_todos t
      JOIN tb_users u ON u.id = t.user_id
      WHERE t.status = 'active'
        AND t.is_reminded = 0
        AND t.reminder_time IS NOT NULL
        AND t.reminder_time <= CURTIME()
    `);

    if (todos.length === 0) {
      info('✅ Tidak ada todo yang perlu diingatkan saat ini.');
      return;
    }

    info(`📋 Menemukan ${todos.length} todo untuk diingatkan.`);

    // Proses setiap todo
    for (const todo of todos) {
      try {
        const chatId = todo.telegram_chat_id
          ? String(todo.telegram_chat_id).replace(/\D/g, '')
          : null;
        // Kirim Telegram jika ada chat_id
        if (chatId) {
          const text =
            `<b>🔔 Reminder</b>\n` +
            `<b>Tugas:</b> ${todo.task_name}\n` +
            (todo.description ? `<b>Deskripsi:</b> ${todo.description}\n` : '') +
            `<b>Waktu:</b> ${todo.reminder_time}\n`;

          const sent = await sendTelegramMessage(chatId, text);

          if (!sent) {
            // Catat kegagalan kirim (jangan tandai is_reminded agar dicoba lagi)
            await db.execute(
              `INSERT INTO tb_todo_history (todo_id, user_id, action_type, action_time, notes)
               VALUES (?, ?, 'failed', NOW(), ?)`,
              [todo.id, todo.user_id, 'Telegram send failed']
            );
            continue;
          }
        } else {
          // Tidak ada chat_id: catat dan lanjut (opsional: tetap tandai diingatkan?)
          await db.execute(
            `INSERT INTO tb_todo_history (todo_id, user_id, action_type, action_time, notes)
             VALUES (?, ?, 'failed', NOW(), 'No telegram_chat_id on user')`,
            [todo.id, todo.user_id]
          );
          continue;
        }

        // Tandai todo sudah diingatkan
        await db.execute(`UPDATE tb_todos SET is_reminded = TRUE WHERE id = ?`, [todo.id]);

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
