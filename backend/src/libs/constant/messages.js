const ErrorCodes = Object.freeze({
  BAD_REQUEST: 'bad_request',
  NOT_FOUND: 'not_found',
  INTERNAL_ERROR: 'internal_error',
});

const ErrorMessages = Object.freeze({
  ROBOT_ID_REQUIRED: 'robotId is required',
  DATABASE_NOT_CONNECTED: 'database not connected',
});

const AlertMessages = Object.freeze({
  lowBattery: (robotId) => `Robot ${robotId} is low battery!`,
  criticalBattery: (robotId) => `Robot ${robotId} will be shut down soon!`,
});

module.exports = { ErrorCodes, ErrorMessages, AlertMessages };
