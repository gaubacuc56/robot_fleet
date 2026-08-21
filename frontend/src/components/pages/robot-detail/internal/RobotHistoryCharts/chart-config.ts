import type { IMetricChartProps } from '@/components/fragments/charts/MetricChart/types'
import { BATTERY_THRESHOLDS } from '@/constants/metrics'
import { COLORS } from '@/constants/ui'

export type TChartConfig = Omit<IMetricChartProps, 'points'>

export const HISTORY_CHARTS: TChartConfig[] = [
  {
    title: 'Battery (shaded = charging)',
    dataKey: 'batteryPercentage',
    color: COLORS.success,
    unit: '%',
    domain: [0, 100],
    threshold: BATTERY_THRESHOLDS.low,
    showChargingBands: true,
  },
  {
    title: 'WiFi signal strength',
    dataKey: 'wifiSignalStrength',
    color: COLORS.primary,
    unit: ' dBm',
    domain: [-100, 0],
  },
  {
    title: 'CPU temperature',
    dataKey: 'temperature',
    color: COLORS.temperature,
    unit: ' °C',
  },
  {
    title: 'Memory usage',
    dataKey: 'memoryUsage',
    color: COLORS.memory,
    unit: '%',
    domain: [0, 100],
  },
]
