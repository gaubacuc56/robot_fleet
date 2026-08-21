const { config } = require('#config/env.config.js');
const {
  alertEvent,
  robotConnectedEvent,
  robotDisconnectedEvent,
  robotUpdateEvent,
} = require('#domain/common/dtos/fleetEvent.dto.js');
const { evaluateAlerts } = require('#features/alert/alert.rules.js');
const { toRobotResponse } = require('#features/robot/dtos/response.js');
const robotRepository = require('#features/robot/robot.repository.js');
const { ErrorMessages } = require('#libs/constant/messages.js');
const { isDatabaseConnected } = require('#libs/database/database.provider.js');
const { logger } = require('#libs/logger/logger.service.js');
const telemetryRepository = require('./telemetry.repository.js');
const { parseAndValidate } = require('./telemetry.validation.js');

/**
 * The ingest pipeline for one telemetry frame. (Q1-R2 to Q1-R6, Q1-R9)
 *
 *   parse and validate -> store reading -> evaluate alerts -> update robot
 *   -> publish update -> publish any alerts
 *
 * Invalid frames are dropped with the socket left open: one bad message must
 * not disconnect an otherwise healthy robot.
 */
function createTelemetryService({ broadcaster }) {
  const thresholds = {
    lowBatteryThreshold: config.lowBatteryThreshold,
    criticalBatteryMinutes: config.criticalBatteryMinutes,
  };

  async function handleFrame({ robotId, raw, now = new Date() }) {
    // During shutdown the database closes before the robot sockets do.
    if (!isDatabaseConnected()) {
      logger.debug(`Dropping frame from ${robotId}: database not connected`);
      return { accepted: false, errors: [ErrorMessages.DATABASE_NOT_CONNECTED] };
    }

    const validation = parseAndValidate(raw, robotId);

    if (!validation.ok) {
      logger.warn(`Rejected message from robot ${robotId}: ${validation.errors.join('; ')}`);
      return { accepted: false, errors: validation.errors };
    }

    const reading = validation.value;

    // Read before the write: the five-minute rule needs the stored start of
    // the low-battery period.
    const previous = await robotRepository.findByRobotId(robotId);

    const { state, alerts } = evaluateAlerts({
      robotId,
      reading,
      // Plain object, not the document: see Robot.toAlertState().
      state: previous ? previous.toAlertState() : null,
      now,
      thresholds,
      online: true,
    });

    await telemetryRepository.insertReading({ reading, receivedAt: now });

    const robot = await robotRepository.applyReading({
      reading,
      alertState: state,
      seenAt: now,
    });

    await broadcaster.publish(robotUpdateEvent(toRobotResponse(robot)));

    for (const alert of alerts) {
      logger.info(`Alert [${alert.severity}] ${alert.message}`);
      await broadcaster.publish(alertEvent(alert));
    }

    return { accepted: true, robot, alerts };
  }

  async function handleRobotConnected(robotId, now = new Date()) {
    if (!isDatabaseConnected()) return null;

    const robot = await robotRepository.markOnline(robotId, now);
    await broadcaster.publish(robotConnectedEvent(robotId, toRobotResponse(robot)));
    return robot;
  }

  async function handleRobotDisconnected(robotId) {
    if (!isDatabaseConnected()) return null;

    const robot = await robotRepository.markOfflineIfOnline(robotId);
    if (!robot) return null;

    await broadcaster.publish(robotDisconnectedEvent(robotId, toRobotResponse(robot)));
    return robot;
  }

  return { handleFrame, handleRobotConnected, handleRobotDisconnected };
}

module.exports = { createTelemetryService };
