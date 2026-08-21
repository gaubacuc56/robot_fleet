const { Telemetry } = require('#domain/entities/schema/telemetry.entity.js');


/**
 * Stores one validated reading. (Q1-R4)
 *
 * `receivedAt` is passed in rather than defaulted here so the whole pipeline
 * stamps a single server clock per frame.
 */
async function insertReading({ reading, receivedAt }) {
  return Telemetry.create({ ...reading, receivedAt });
}

/**
 * Downsampled history for one robot. (Q1-R8)
 *
 * Six hours at 1 Hz is 21,600 documents, so readings are bucketed and averaged
 * server-side, driven by the { robotId, timestamp } index. isCharging cannot be
 * averaged: a bucket counts as charging if any reading in it was.
 */
async function findHistory({ robotId, from, to, bucketSeconds }) {
  const bucketMs = Math.max(1, bucketSeconds) * 1000;

  const points = await Telemetry.aggregate([
    { $match: { robotId, timestamp: { $gte: from, $lte: to } } },
    {
      $group: {
        _id: {
          $toDate: {
            $subtract: [
              { $toLong: '$timestamp' },
              { $mod: [{ $toLong: '$timestamp' }, bucketMs] },
            ],
          },
        },
        batteryPercentage: { $avg: '$batteryPercentage' },
        wifiSignalStrength: { $avg: '$wifiSignalStrength' },
        temperature: { $avg: '$temperature' },
        memoryUsage: { $avg: '$memoryUsage' },
        chargingSamples: { $sum: { $cond: ['$isCharging', 1, 0] } },
        samples: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        timestamp: '$_id',
        batteryPercentage: { $round: ['$batteryPercentage', 1] },
        wifiSignalStrength: { $round: ['$wifiSignalStrength', 0] },
        temperature: { $round: ['$temperature', 1] },
        memoryUsage: { $round: ['$memoryUsage', 0] },
        isCharging: { $gt: ['$chargingSamples', 0] },
        samples: 1,
      },
    },
  ]);

  return points.map((point) => ({
    ...point,
    timestamp: point.timestamp.toISOString(),
  }));
}

module.exports = { insertReading, findHistory };
