const { config } = require('#config/env.config.js');
const { robotDisconnectedEvent } = require('#domain/common/dtos/fleetEvent.dto.js');
const { toRobotResponse } = require('#features/robot/dtos/response.js');
const robotRepository = require('#features/robot/robot.repository.js');
const { logger } = require('#libs/logger/logger.service.js');

function createPresenceService({ broadcaster }) {
  let timer = null;

  async function sweep(now = new Date()) {
    const cutoff = new Date(now.getTime() - config.offlineTimeoutMs);

    try {
      const transitioned = await robotRepository.markStaleOffline(cutoff);

      for (const robot of transitioned) {
        logger.info(
          `Robot ${robot.robotId} went offline (silent since ${robot.lastSeen?.toISOString()})`
        );
        await broadcaster.publish(
          robotDisconnectedEvent(robot.robotId, toRobotResponse(robot))
        );
      }

      return transitioned;
    } catch (error) {
      logger.error('Presence sweep failed:', error.message);
      return [];
    }
  }

  function start() {
    if (timer) return;
    timer = setInterval(() => {
      sweep();
    }, config.presenceSweepIntervalMs);
    // Do not hold the event loop open on shutdown.
    timer.unref();
    logger.debug(
      `Presence sweep every ${config.presenceSweepIntervalMs}ms, timeout ${config.offlineTimeoutMs}ms`
    );
  }

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  return { sweep, start, stop };
}

module.exports = { createPresenceService };
