const { initialRobotsEvent } = require('#domain/common/dtos/fleetEvent.dto.js');
const { activeAlerts } = require('#features/alert/alert.rules.js');
const { toRobotResponse } = require('#features/robot/dtos/response.js');
const robotRepository = require('#features/robot/robot.repository.js');
const { logger } = require('#libs/logger/logger.service.js');
const { DASHBOARD_TOPIC } = require('./dashboard.constant.js');

function createDashboardGateway() {
  return {
    idleTimeout: 0,
    maxPayloadLength: 16 * 1024,

    open: (ws) => {
      ws.subscribe(DASHBOARD_TOPIC);
      logger.info('Dashboard client connected');

      robotRepository
        .findAll()
        .then((robots) => {
          const alerts = robots.flatMap((robot) => activeAlerts(robot));
          const payload = initialRobotsEvent(robots.map(toRobotResponse), alerts);
          try {
            ws.send(JSON.stringify(payload));
          } catch {
            logger.debug('Dashboard client closed before initial state was sent');
          }
        })
        .catch((error) => logger.error('Failed to send initial fleet state:', error.message));
    },

    message: (ws, message) => {
      logger.debug('Ignoring unsolicited dashboard message', Buffer.from(message).toString());
    },

    close: () => {
      logger.info('Dashboard client disconnected');
    },
  };
}

module.exports = { createDashboardGateway };
