const { config } = require('#config/env.config.js');
const { MAX_BUCKET_SECONDS } = require('../telemetry.constant.js');

function resolveHistoryWindow({ hours, bucketSeconds, now = new Date() }) {
  const requestedHours =
    Number.isFinite(hours) && hours > 0 ? hours : config.historyWindowHours;
  const safeHours = Math.min(requestedHours, config.historyMaxHours);

  const requestedBucket =
    Number.isFinite(bucketSeconds) && bucketSeconds > 0
      ? bucketSeconds
      : config.historyBucketSeconds;

  return {
    from: new Date(now.getTime() - safeHours * 60 * 60 * 1000),
    to: now,
    hours: safeHours,
    bucketSeconds: Math.min(requestedBucket, MAX_BUCKET_SECONDS),
  };
}

module.exports = { resolveHistoryWindow };
