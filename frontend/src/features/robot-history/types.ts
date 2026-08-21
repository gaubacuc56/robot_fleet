export interface IHistoryPoint {
  timestamp: string
  batteryPercentage: number
  wifiSignalStrength: number
  temperature: number
  memoryUsage: number
  isCharging: boolean
  samples?: number
}

export type THistoryMetric = Exclude<
  keyof IHistoryPoint,
  'timestamp' | 'isCharging' | 'samples'
>

export interface IHistoryWindow {
  hours?: number
  bucketSeconds?: number
}
