import { WIFI_THRESHOLDS, type TWifiQuality } from '@/constants/metrics'
import { COLORS } from '@/constants/ui'

export function toWifiQuality(dbm: number): TWifiQuality {
  if (dbm >= WIFI_THRESHOLDS.strong) return 'strong'
  if (dbm >= WIFI_THRESHOLDS.fair) return 'fair'
  return 'weak'
}

export const WIFI_QUALITY_COLORS: Record<TWifiQuality, string> = {
  strong: COLORS.success,
  fair: COLORS.warning,
  weak: COLORS.error,
}
