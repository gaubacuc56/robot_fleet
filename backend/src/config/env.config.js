require('dotenv').config();

const os = require('node:os');

function intFromEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    console.warn(`[config] ${name}="${raw}" is not a number, using ${fallback}`);
    return fallback;
  }

  return Math.trunc(parsed);
}

const MAX_WORKERS = 4;

function resolveWorkerCount() {
  const requested = intFromEnv('WORKERS', os.cpus().length);
  return Math.max(1, Math.min(requested, MAX_WORKERS));
}

const config = {
  port: intFromEnv('PORT', 8080),

  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/robot-fleet',

  // Silence longer than this marks a robot offline. (Q1-R7)
  offlineTimeoutMs: intFromEnv('OFFLINE_TIMEOUT_MS', 10000),

  presenceSweepIntervalMs: intFromEnv('PRESENCE_SWEEP_INTERVAL_MS', 5000),

  historyWindowHours: intFromEnv('HISTORY_WINDOW_HOURS', 6),
  historyMaxHours: intFromEnv('HISTORY_MAX_HOURS', 24),
  historyBucketSeconds: intFromEnv('HISTORY_BUCKET_SECONDS', 30),
  lowBatteryThreshold: intFromEnv('LOW_BATTERY_THRESHOLD', 20),
  criticalBatteryMinutes: intFromEnv('CRITICAL_BATTERY_MINUTES', 5),

  // Optional; enables cross-process fan-out. (Q4-R3)
  redisUrl: process.env.REDIS_URL || null,

  workers: resolveWorkerCount(),
  maxWorkers: MAX_WORKERS,

  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = { config, intFromEnv, resolveWorkerCount, MAX_WORKERS };
