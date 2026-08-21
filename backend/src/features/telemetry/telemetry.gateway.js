const qs = require('node:querystring');

const { logger } = require('#libs/logger/logger.service.js');

/**
 * WS /robots — telemetry ingest from the simulators. (Q1-R2, Q1-R7)
 *
 * robotId arrives once in the upgrade query string and is kept on the socket;
 * the payload does not carry it, despite what INSTRUCTIONS.md shows. An upgrade
 * without one is refused, or that data would be stored under an undefined id.
 */
function createTelemetryGateway({ telemetryService }) {
  return {
    idleTimeout: 0,
    maxPayloadLength: 16 * 1024,

    upgrade: (res, req, context) => {
      const secWebSocketKey = req.getHeader('sec-websocket-key');
      const secWebSocketProtocol = req.getHeader('sec-websocket-protocol');
      const secWebSocketExtensions = req.getHeader('sec-websocket-extensions');
      const query = qs.parse(req.getQuery() || '');

      const robotId = typeof query.robotId === 'string' ? query.robotId.trim() : '';

      if (robotId === '') {
        logger.warn('Refused /robots upgrade: missing robotId query parameter');
        res.cork(() => {
          res.writeStatus('400');
          res.end('robotId query parameter is required');
        });
        return;
      }

      res.upgrade(
        { robotId },
        secWebSocketKey,
        secWebSocketProtocol,
        secWebSocketExtensions,
        context
      );
    },

    open: (ws) => {
      const { robotId } = ws.getUserData();
      logger.info(`Robot ${robotId} connected`);

      telemetryService
        .handleRobotConnected(robotId)
        .catch((error) => logger.error(`Failed to mark ${robotId} online:`, error.message));
    },

    message: (ws, message) => {
      const { robotId } = ws.getUserData();

      // The frame is only valid for the duration of this callback, so copy it
      // before handing it to an async pipeline.
      const raw = Buffer.from(message);

      telemetryService
        .handleFrame({ robotId, raw })
        .catch((error) =>
          logger.error(`Failed to process frame from ${robotId}:`, error.message)
        );
    },

    close: (ws) => {
      const { robotId } = ws.getUserData();
      logger.info(`Robot ${robotId} disconnected`);

      telemetryService
        .handleRobotDisconnected(robotId)
        .catch((error) => logger.error(`Failed to mark ${robotId} offline:`, error.message));
    },
  };
}

module.exports = { createTelemetryGateway };
