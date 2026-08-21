export const BATTERY_THRESHOLDS = {
  low: 20,
} as const

export const TEMPERATURE_THRESHOLDS = {
  warning: 55,
  critical: 65,
} as const

export const MEMORY_THRESHOLDS = {
  warning: 60,
  critical: 75,
} as const

export const WIFI_THRESHOLDS = {
  strong: -60,
  fair: -75,
} as const

export type TWifiQuality = 'strong' | 'fair' | 'weak'
