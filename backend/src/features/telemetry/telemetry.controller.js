const qs = require('node:querystring');

const { ErrorMessages } = require('#libs/constant/messages.js');
const { asyncHandler } = require('#libs/http/asyncHandler.util.js');
const { badRequest, writeJson } = require('#libs/http/response.util.js');
const { resolveHistoryWindow } = require('./dtos/request.js');
const { toHistoryResponse } = require('./dtos/response.js');
const telemetryRepository = require('./telemetry.repository.js');

/**
 * History endpoint. (Q1-R8)
 *
 *   GET /api/robots/:robotId/history?hours=6&bucketSeconds=30
 */
function registerTelemetryRoutes(app) {
  app.get(
    '/api/robots/:robotId/history',
    asyncHandler(async (res, context) => {
      const robotId = context.params[0];
      if (!robotId) return badRequest(res, ErrorMessages.ROBOT_ID_REQUIRED);

      const query = qs.parse(context.query);
      const window = resolveHistoryWindow({
        hours: Number(query.hours),
        bucketSeconds: Number(query.bucketSeconds),
      });

      const points = await telemetryRepository.findHistory({
        robotId,
        from: window.from,
        to: window.to,
        bucketSeconds: window.bucketSeconds,
      });

      // An empty series is a valid answer: a freshly started system has no
      // six hours of history yet.
      writeJson(res, 200, toHistoryResponse({ robotId, window, points }));
    })
  );

  return app;
}

module.exports = { registerTelemetryRoutes };
