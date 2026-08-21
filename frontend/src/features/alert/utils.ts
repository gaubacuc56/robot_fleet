import { MAX_ALERTS } from './constants'
import type { IAlert } from './types'

export function mergeAlerts(current: IAlert[], incoming: IAlert[]): IAlert[] {
  if (incoming.length === 0) return current

  const seen = new Set(current.map((alert) => alert.id))
  const fresh = incoming.filter((alert) => !seen.has(alert.id))
  if (fresh.length === 0) return current

  return [...fresh.reverse(), ...current].slice(0, MAX_ALERTS)
}

export function countBySeverity(alerts: IAlert[]): {
  errors: number
  warnings: number
} {
  const errors = alerts.filter((alert) => alert.severity === 'error').length
  return { errors, warnings: alerts.length - errors }
}
