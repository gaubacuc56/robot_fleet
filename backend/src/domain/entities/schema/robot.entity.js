const mongoose = require('mongoose');

const { ROBOT_STATUSES, RobotStatus } = require('#domain/common/enum/robotStatus.enum.js');

const robotSchema = new mongoose.Schema(
  {
    robotId: { type: String, required: true, unique: true },

    batteryPercentage: { type: Number, default: null },
    wifiSignalStrength: { type: Number, default: null },
    isCharging: { type: Boolean, default: null },
    temperature: { type: Number, default: null },
    memoryUsage: { type: Number, default: null },

    timestamp: { type: Date, default: null },
    firstSeen: { type: Date, default: null },
    lastSeen: { type: Date, default: null },

    status: { type: String, enum: ROBOT_STATUSES, default: RobotStatus.OFFLINE },

    lowBatterySince: { type: Date, default: null },
    lowBatteryNotified: { type: Boolean, default: false },
    criticalBatteryNotified: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

robotSchema.index({ status: 1, lastSeen: 1 });

robotSchema.methods.toAlertState = function toAlertState() {
  return {
    lowBatterySince: this.lowBatterySince,
    lowBatteryNotified: this.lowBatteryNotified,
    criticalBatteryNotified: this.criticalBatteryNotified,
  };
};

const Robot = mongoose.models.Robot || mongoose.model('Robot', robotSchema);

module.exports = { Robot };
