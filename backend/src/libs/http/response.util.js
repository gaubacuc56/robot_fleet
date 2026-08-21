const { ErrorCodes } = require('#libs/constant/messages.js');

function writeJson(res, statusCode, payload) {
  if (res.aborted) return;

  const body = JSON.stringify(payload);

  res.cork(() => {
    res.writeStatus(String(statusCode));
    res.writeHeader('Content-Type', 'application/json');
    res.end(body);
  });
}

function notFound(res) {
  writeJson(res, 404, { error: ErrorCodes.NOT_FOUND });
}

function badRequest(res, message) {
  writeJson(res, 400, { error: ErrorCodes.BAD_REQUEST, message });
}

function internalError(res) {
  writeJson(res, 500, { error: ErrorCodes.INTERNAL_ERROR });
}

module.exports = { writeJson, notFound, badRequest, internalError };
