// Utility untuk membuat timestamp dengan format [YYYY-MM-DD HH:mm:ss]
const timestamp = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').split('.')[0];
};

// Fungsi log utama
export const info = (...args) => {
  console.log(`\x1b[32m[INFO ${timestamp()}]\x1b[0m`, ...args); // Hijau
};

export const warn = (...args) => {
  console.warn(`\x1b[33m[WARN ${timestamp()}]\x1b[0m`, ...args); // Kuning
};

export const error = (...args) => {
  console.error(`\x1b[31m[ERROR ${timestamp()}]\x1b[0m`, ...args); // Merah
};

export const debug = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`\x1b[36m[DEBUG ${timestamp()}]\x1b[0m`, ...args); // Cyan
  }
};

// Default export (opsional)
export default { info, warn, error, debug };
