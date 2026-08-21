function toHistoryResponse({ robotId, window, points }) {
  return {
    robotId,
    from: window.from.toISOString(),
    to: window.to.toISOString(),
    hours: window.hours,
    bucketSeconds: window.bucketSeconds,
    points,
  };
}

module.exports = { toHistoryResponse };
