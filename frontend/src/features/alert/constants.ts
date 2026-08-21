import type { TAlertSeverity } from './types'

export const MAX_ALERTS = 50

export const ALERT_TITLES: Record<TAlertSeverity, string> = {
  error: 'Critical battery',
  warning: 'Low battery',
}

export const ALERT_TOAST_DURATION: Record<TAlertSeverity, number> = {
  error: 0,
  warning: 6,
}
