import { schedule } from 'node-cron';
import { checkDeadlines } from '../services/schedulerService.js';
import { checkAndSendReminders } from '../services/reminderService.js';
import { info, error as _error } from '../utils/logger.js';

export function initCronJobs() {
  // Cron untuk cek reminder (setiap 1 menit)
  const reminderSchedule = process.env.REMINDER_CRON_SCHEDULE || '*/1 * * * *';
  schedule(reminderSchedule, async () => {
    info('🔔 Running reminder checker...');
    try {
      await checkAndSendReminders();
    } catch (error) {
      _error('Error in reminder cron:', error);
    }
  });

  // Cron untuk cek deadline/scheduler (setiap 1 menit)
  const schedulerSchedule = process.env.SCHEDULER_CHECK_CRON || '*/1 * * * *';
  schedule(schedulerSchedule, async () => {
    info('⏰ Running scheduler checker...');
    try {
      await checkDeadlines();
    } catch (error) {
      _error('Error in scheduler cron:', error);
    }
  });

  info('✅ Cron jobs scheduled successfully');
}

export default { initCronJobs };
