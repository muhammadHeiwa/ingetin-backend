import 'dotenv/config';
import { createPool } from 'mysql2/promise';
import { info, error } from '../utils/logger.js';

const pool = createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test koneksi ke database
(async () => {
  try {
    const connection = await pool.getConnection();
    info('✅ Database connected successfully');
    connection.release();
  } catch (err) {
    error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
})();

export default pool;
