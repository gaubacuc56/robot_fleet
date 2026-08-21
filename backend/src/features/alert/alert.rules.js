const { AlertSeverity } = require('#domain/common/enum/alertSeverity.enum.js');
const { AlertType } = require('#domain/common/enum/alertType.enum.js');
const { AlertMessages } = require('#libs/constant/messages.js');
const { DEFAULT_ALERT_THRESHOLDS } = require('./alert.constant.js');
const { toAlertResponse } = require('./dtos/response.js');

/**
 * Battery alert rules. (Q2-R5 to Q2-R10)
 *
 * Pure state machine: no clock, no database, no sockets. `now` is a parameter,
 * so the five-minute rule is evaluated against a caller-supplied instant.
 *
 *   Low battery       battery < 20% AND not charging; fires once on entry
 *   Critical battery  the same condition held 5+ consecutive minutes
 *   Both reset at battery >= 20% OR charging
 */

function initialAlertState() {
  return {
    lowBatterySince: null,
    lowBatteryNotified: false,
    criticalBatteryNotified: false,
  };
}

/** Strict comparison: 20% exactly is not low. */
function isLowBatteryCondition(reading, thresholds) {
  return (
    reading.batteryPercentage < thresholds.lowBatteryThreshold &&
    reading.isCharging !== true
  );
}

/**
 * @param {object}  input
 * @param {object}  input.state    previous alert state, or null to start fresh
 * @param {boolean} [input.online] false freezes the countdown (assumption Q-B)
 * @returns {{state: object, alerts: object[]}}
 */
function evaluateAlerts({ robotId, reading, state, now, thresholds, online = true }) {
  const limits = { ...DEFAULT_ALERT_THRESHOLDS, ...thresholds };
  const previous = state ? { ...initialAlertState(), ...state } : initialAlertState();
  const alerts = [];

  if (!online) {
    return { state: previous, alerts };
  }

  if (!isLowBatteryCondition(reading, limits)) {
    return { state: initialAlertState(), alerts };
  }

  const next = { ...previous };

  if (next.lowBatterySince === null) {
    next.lowBatterySince = now;
  }

  if (!next.lowBatteryNotified) {
    next.lowBatteryNotified = true;
    alerts.push(
      toAlertResponse({
        type: AlertType.LOW_BATTERY,
        robotId,
        timestamp: now,
        severity: AlertSeverity.WARNING,
        message: AlertMessages.lowBattery(robotId),
      })
    );
  }

  const elapsedMs = now.getTime() - new Date(next.lowBatterySince).getTime();
  const criticalAfterMs = limits.criticalBatteryMinutes * 60 * 1000;

  if (!next.criticalBatteryNotified && elapsedMs >= criticalAfterMs) {
    next.criticalBatteryNotified = true;
    alerts.push(
      toAlertResponse({
        type: AlertType.CRITICAL_BATTERY,
        robotId,
        timestamp: now,
        severity: AlertSeverity.ERROR,
        message: AlertMessages.criticalBattery(robotId),
      })
    );
  }

  return { state: next, alerts };
}

function activeAlerts(robot) {
  if (!robot) return [];

  const since = robot.lowBatterySince ? new Date(robot.lowBatterySince) : new Date();
  const result = [];

  if (robot.lowBatteryNotified) {
    result.push(
      toAlertResponse({
        type: AlertType.LOW_BATTERY,
        robotId: robot.robotId,
        timestamp: since,
        severity: AlertSeverity.WARNING,
        message: AlertMessages.lowBattery(robot.robotId),
      })
    );
  }

  if (robot.criticalBatteryNotified) {
    result.push(
      toAlertResponse({
        type: AlertType.CRITICAL_BATTERY,
        robotId: robot.robotId,
        timestamp: since,
        severity: AlertSeverity.ERROR,
        message: AlertMessages.criticalBattery(robot.robotId),
      })
    );
  }

  return result;
}

module.exports = {
  evaluateAlerts,
  activeAlerts,
  initialAlertState,
  isLowBatteryCondition,
};
