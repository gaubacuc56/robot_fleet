const RobotStatus = Object.freeze({
  ONLINE: 'online',
  OFFLINE: 'offline',
});

const ROBOT_STATUSES = Object.values(RobotStatus);

module.exports = { RobotStatus, ROBOT_STATUSES };
