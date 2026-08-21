export type TAlertType = 'low_battery' | 'critical_battery' | 'offline'
export type TAlertSeverity = 'warning' | 'error'

export interface IAlert {
  id: string
  robotId: string
  type: TAlertType
  severity: TAlertSeverity
  message: string
  timestamp: string
}
