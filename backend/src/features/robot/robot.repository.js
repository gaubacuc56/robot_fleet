const { RobotStatus } = require('#domain/common/enum/robotStatus.enum.js');
const { Robot } = require('#domain/entities/schema/robot.entity.js');

async function applyReading({ reading, alertState, seenAt }) {
  return Robot.findOneAndUpdate(
    { robotId: reading.robotId },
    {
      $set: {
        batteryPercentage: reading.batteryPercentage,
        wifiSignalStrength: reading.wifiSignalStrength,
        isCharging: reading.isCharging,
        temperature: reading.temperature,
        memoryUsage: reading.memoryUsage,
        timestamp: reading.timestamp,
        lastSeen: seenAt,
        status: RobotStatus.ONLINE,
        lowBatterySince: alertState.lowBatterySince,
        lowBatteryNotified: alertState.lowBatteryNotified,
        criticalBatteryNotified: alertState.criticalBatteryNotified,
      },
      $setOnInsert: { firstSeen: seenAt },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function findAll() {
  return Robot.find({}).sort({ robotId: 1 });
}

async function findByRobotId(robotId) {
  return Robot.findOne({ robotId });
}

async function markOnline(robotId, at = new Date()) {
  return Robot.findOneAndUpdate(
    { robotId },
    {
      $set: { status: RobotStatus.ONLINE, lastSeen: at },
      $setOnInsert: { firstSeen: at },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function markOfflineIfOnline(robotId) {
  return Robot.findOneAndUpdate(
    { robotId, status: RobotStatus.ONLINE },
    { $set: { status: RobotStatus.OFFLINE } },
    { new: true }
  );
}

async function markStaleOffline(cutoff) {
  const stale = await Robot.find({
    status: RobotStatus.ONLINE,
    $or: [{ lastSeen: { $lt: cutoff } }, { lastSeen: null }],
  }).select('robotId');

  const transitioned = [];
  for (const candidate of stale) {
    const updated = await markOfflineIfOnline(candidate.robotId);
    if (updated) transitioned.push(updated);
  }

  return transitioned;
}

module.exports = {
  applyReading,
  findAll,
  findByRobotId,
  markOnline,
  markOfflineIfOnline,
  markStaleOffline,
};
