const uWS = require('uWebSockets.js');

const { config } = require('#config/env.config.js');
const { DASHBOARD_TOPIC } = require('#features/dashboard/dashboard.constant.js');
const { createDashboardGateway } = require('#features/dashboard/dashboard.gateway.js');
const { registerHealthRoutes } = require('#features/health/health.controller.js');
const { createPresenceService } = require('#features/presence/presence.service.js');
const { registerRobotRoutes } = require('#features/robot/robot.controller.js');
const { registerTelemetryRoutes } = require('#features/telemetry/telemetry.controller.js');
const { createTelemetryGateway } = require('#features/telemetry/telemetry.gateway.js');
const { createTelemetryService } = require('#features/telemetry/telemetry.service.js');
const { createBroadcaster } = require('#libs/broadcaster/broadcaster.factory.js');
const { connectDatabase, disconnectDatabase } = require('#libs/database/database.provider.js');
const { asyncHandler } = require('#libs/http/asyncHandler.util.js');
const { notFound } = require('#libs/http/response.util.js');
const { logger } = require('#libs/logger/logger.service.js');

/**
 *   gateways / controllers -> services -> { rules, repositories, broadcaster }
 *
 *   WS  /robots     telemetry ingest from simulators   (Q1-R2..R5)
 *   WS  /dashboard  fan-out to browser clients          (Q1-R6)
 *   GET /api/*      REST, including 6h history          (Q1-R8)
 *   GET /health     container healthcheck
 */
async function createApp({ port = config.port } = {}) {
  await connectDatabase();

  const broadcaster = await createBroadcaster({ redisUrl: config.redisUrl });
  const telemetryService = createTelemetryService({ broadcaster });
  const presenceService = createPresenceService({ broadcaster });

  const app = uWS.App({
    maxCompressedSize: 64 * 1024,
    maxBackpressure: 64 * 1024,
  });

  app.ws('/robots', createTelemetryGateway({ telemetryService }));
  app.ws('/dashboard', createDashboardGateway());

  registerHealthRoutes(app);
  registerRobotRoutes(app);
  registerTelemetryRoutes(app);

  // Registered last: uWS matches in registration order, so a catch-all placed
  // earlier would swallow every route above it.
  app.any(
    '/*',
    asyncHandler(async (res) => {
      notFound(res);
    })
  );

  // The one point where an event — local or from another worker — becomes a
  // WebSocket frame for this worker's dashboard subscribers.
  broadcaster.onMessage((message) => {
    app.publish(DASHBOARD_TOPIC, JSON.stringify(message));
  });

  const listenSocket = await new Promise((resolve, reject) => {
    app.listen(port, (token) => {
      if (token) resolve(token);
      else reject(new Error(`Failed to listen on port ${port}`));
    });
  });

  presenceService.start();

  logger.info(`Robot Fleet Server listening on port ${port} (broadcaster: ${broadcaster.kind})`);

  let closed = false;

  async function stop() {
    if (closed) return;
    closed = true;

    logger.info('Shutting down server...');
    presenceService.stop();

    if (listenSocket) uWS.us_listen_socket_close(listenSocket);
    await broadcaster
      .close()
      .catch((error) => logger.error('Broadcaster close failed:', error.message));
    await disconnectDatabase().catch((error) =>
      logger.error('Mongo close failed:', error.message)
    );

    logger.info('Shutdown complete');
  }

  return { app, stop, broadcaster, telemetryService, presenceService, port };
}

module.exports = { createApp };
