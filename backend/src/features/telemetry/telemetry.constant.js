const NUMERIC_FIELDS = Object.freeze([
  { name: 'batteryPercentage', min: 0, max: 100 },
  { name: 'wifiSignalStrength', min: -100, max: 0 },
  { name: 'temperature', min: -20, max: 150 },
  { name: 'memoryUsage', min: 0, max: 100 },
]);

const MAX_BUCKET_SECONDS = 3600;

module.exports = { NUMERIC_FIELDS, MAX_BUCKET_SECONDS };
