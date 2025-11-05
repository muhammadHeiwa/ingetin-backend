import { Telegraf } from 'telegraf';
import db from '../config/database.js';
import { info, error } from '../utils/logger.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN tidak di-set');

export const bot = new Telegraf(BOT_TOKEN);

/**
 * Handler dasar
 */
bot.start(async (ctx) => {
  const chatId = ctx.chat.id;
  const username = ctx.from?.username || null;

  // Beri instruksi linking
  await ctx.reply(
    `Hai ${ctx.from.first_name || ''}! 👋\n` +
    `Chat ID kamu: ${chatId}\n\n` +
    `1) Buka aplikasi Ingetin (sudah login)\n` +
    `2) Isi form connection dengan Chat ID di atas\n` +
    `3) Setelah tersimpan, reminder otomatis akan dikirim ke Telegram ini.`
  );

  // Simpan hint username di DB jika mau (opsional, tanpa mengubah owner)
  try {
    await db.execute(
      'UPDATE tb_users SET telegram_username = COALESCE(?, telegram_username) WHERE telegram_chat_id = ?',
      [username, chatId]
    );
  } catch (e) {
    // boleh diabaikan
  }
});

/**
 * Opsional: simple /ping
 */
bot.command('ping', (ctx) => ctx.reply('pong ✅'));

/**
 * Start bot:
 * - Development: polling
 * - Production (punya domain/HTTPS): webhook
 */
export async function startTelegramBot(app) {
  try {
    if (process.env.TELEGRAM_WEBHOOK_URL) {
      const url = process.env.TELEGRAM_WEBHOOK_URL;
      await bot.telegram.setWebhook(url);
      app.use(bot.webhookCallback('/telegram/webhook'));  // pasang route webhook
      info(`🤖 Telegram webhook set di ${url}`);
    } else {
      await bot.launch();
      info('🤖 Telegram bot started (polling)');
    }

    // Graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
  } catch (e) {
    error('Gagal start Telegram bot:', e.message);
  }
}

/**
 * Helper kirim pesan
 */
export async function sendTelegramMessage(chatId, text, extra = {}) {
  if (!chatId) return false;
  try {
    await bot.telegram.sendMessage(chatId, text, { parse_mode: 'HTML', ...extra });
    return true;
  } catch (e) {
    error('Gagal kirim Telegram:', e.message);
    return false;
  }
}

export default { bot, startTelegramBot, sendTelegramMessage };
