import type { IRobot } from '@/model/robot'
import type { IHistoryPoint } from './types'

export function toHistoryPoint(robot: IRobot): IHistoryPoint | null {
  if (
    robot.timestamp === null ||
    robot.batteryPercentage === null ||
    robot.wifiSignalStrength === null ||
    robot.temperature === null ||
    robot.memoryUsage === null
  ) {
    return null
  }

  return {
    timestamp: robot.timestamp,
    batteryPercentage: robot.batteryPercentage,
    wifiSignalStrength: robot.wifiSignalStrength,
    temperature: robot.temperature,
    memoryUsage: robot.memoryUsage,
    isCharging: robot.isCharging === true,
  }
}

export function withinWindow(
  points: IHistoryPoint[],
  hours: number,
  now = Date.now()
): IHistoryPoint[] {
  const cutoff = now - hours * 60 * 60 * 1000
  return points.filter(
    (point) => new Date(point.timestamp).getTime() >= cutoff
  )
}
