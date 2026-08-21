const FleetEventType = Object.freeze({
  INITIAL_ROBOTS: 'initial_robots',
  ROBOT_UPDATE: 'robot_update',
  ROBOT_CONNECTED: 'robot_connected',
  ROBOT_DISCONNECTED: 'robot_disconnected',
  ALERT: 'alert',
});

module.exports = { FleetEventType };
