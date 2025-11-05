import db from '../config/database.js';

export async function linkTelegram(req, res, next) {
  try {
    const { chat_id, username = null } = req.body;
    if (isNaN(Number(chat_id))) {
      return res.status(400).json({ success: false, message: 'Invalid chat_id' });
    }

    // simpan di user yang sedang login
    await db.execute(
      `UPDATE tb_users SET telegram_chat_id = ?, telegram_username = ? WHERE id = ?`,
      [chat_id, username, req.user.id]
    );

    return res.json({ success: true, message: 'Telegram linked successfully', chat_id });
  } catch (err) {
    next(err);
  }
}
