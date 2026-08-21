const { config } = require('#config/env.config.js');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const threshold = LEVELS[config.logLevel] ?? LEVELS.info;

function emit(level, args) {
  if (LEVELS[level] > threshold) return;

  const stream = level === 'error' || level === 'warn' ? console.error : console.log;
  stream(`[${level}] pid=${process.pid}`, ...args);
}

const logger = {
  error: (...args) => emit('error', args),
  warn: (...args) => emit('warn', args),
  info: (...args) => emit('info', args),
  debug: (...args) => emit('debug', args),
};

module.exports = { logger };
