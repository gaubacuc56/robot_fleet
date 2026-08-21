const { logger } = require('#libs/logger/logger.service.js');
const { internalError } = require('./response.util.js');

function asyncHandler(handler) {
  return (res, req) => {
    // Capture request data now: req is only valid synchronously.
    const context = {
      url: req.getUrl(),
      query: req.getQuery() || '',
      params: [req.getParameter(0)],
    };

    res.aborted = false;
    res.onAborted(() => {
      res.aborted = true;
    });

    Promise.resolve(handler(res, context)).catch((error) => {
      logger.error(`Unhandled error on ${context.url}:`, error.message);
      internalError(res);
    });
  };
}

module.exports = { asyncHandler };
