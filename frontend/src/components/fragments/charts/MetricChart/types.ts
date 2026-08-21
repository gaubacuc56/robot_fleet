import type { THistoryMetric, IHistoryPoint } from '@/features/robot-history/types'

export interface IMetricChartProps {
  title: string
  points: IHistoryPoint[]
  dataKey: THistoryMetric
  color: string
  unit: string
  domain?: [number, number]
  threshold?: number
  showChargingBands?: boolean
  height?: number
}

export type TChargingBand = [string, string]
