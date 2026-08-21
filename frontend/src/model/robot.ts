export type TRobotStatus = 'online' | 'offline'

export interface IRobot {
  robotId: string
  batteryPercentage: number | null
  wifiSignalStrength: number | null
  isCharging: boolean | null
  temperature: number | null
  memoryUsage: number | null
  timestamp: string | null
  lastSeen: string | null
  status: TRobotStatus
}

export function createEmptyRobot(robotId: string): IRobot {
  return {
    robotId,
    batteryPercentage: null,
    wifiSignalStrength: null,
    isCharging: null,
    temperature: null,
    memoryUsage: null,
    timestamp: null,
    lastSeen: null,
    status: 'offline',
  }
}
