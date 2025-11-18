export const logger = {
  info(message, meta = {}) {
    console.log(`[info] ${message}`, Object.keys(meta).length ? meta : '');
  },
  warn(message, meta = {}) {
    console.warn(`[warn] ${message}`, Object.keys(meta).length ? meta : '');
  },
  error(message, meta = {}) {
    console.error(`[error] ${message}`, Object.keys(meta).length ? meta : '');
  }
};

