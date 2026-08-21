import type { IAlert } from '@/features/alert/types'
import type { IRobot } from '@/model/robot'

export type TFleetEventType =
  | 'initial_robots'
  | 'robot_update'
  | 'robot_connected'
  | 'robot_disconnected'
  | 'alert'

export interface IFleetEvent {
  type: TFleetEventType
  robotId?: string
  data?: IRobot
  robots?: IRobot[]
  alerts?: IAlert[]
  alert?: IAlert
}

export interface IFleetState {
  robotsById: Record<string, IRobot>
  alerts: IAlert[]
  hasLoadedInitial: boolean
}
