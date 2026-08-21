const { FleetEventType } = require('#domain/common/enum/fleetEventType.enum.js');

function initialRobotsEvent(robots, alerts = []) {
  return {
    type: FleetEventType.INITIAL_ROBOTS,
    robots,
    alerts,
  };
}

function robotUpdateEvent(robot) {
  return {
    type: FleetEventType.ROBOT_UPDATE,
    robotId: robot.robotId,
    data: robot,
  };
}

function robotConnectedEvent(robotId, robot = null) {
  return {
    type: FleetEventType.ROBOT_CONNECTED,
    robotId,
    data: robot,
  };
}

function robotDisconnectedEvent(robotId, robot = null) {
  return {
    type: FleetEventType.ROBOT_DISCONNECTED,
    robotId,
    data: robot,
  };
}

function alertEvent(alert) {
  return {
    type: FleetEventType.ALERT,
    robotId: alert.robotId,
    alert,
  };
}

module.exports = {
  initialRobotsEvent,
  robotUpdateEvent,
  robotConnectedEvent,
  robotDisconnectedEvent,
  alertEvent,
};
