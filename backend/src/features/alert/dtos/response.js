function toAlertResponse({ type, robotId, timestamp, severity, message }) {
  return {
    id: `${robotId}:${type}:${timestamp.toISOString()}`,
    robotId,
    type,
    severity,
    message,
    timestamp: timestamp.toISOString(),
  };
}

module.exports = { toAlertResponse };
