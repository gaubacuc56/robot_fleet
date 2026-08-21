/**
 * The robot shape sent to clients; Mongo internals stay on the server.
 * Mirrors IRobot in frontend/src/model/robot.ts — change both together.
 */
function toRobotResponse(robot) {
  return {
    robotId: robot.robotId,
    batteryPercentage: robot.batteryPercentage,
    wifiSignalStrength: robot.wifiSignalStrength,
    isCharging: robot.isCharging,
    temperature: robot.temperature,
    memoryUsage: robot.memoryUsage,
    timestamp: robot.timestamp ? robot.timestamp.toISOString() : null,
    lastSeen: robot.lastSeen ? robot.lastSeen.toISOString() : null,
    status: robot.status,
  };
}

module.exports = { toRobotResponse };
