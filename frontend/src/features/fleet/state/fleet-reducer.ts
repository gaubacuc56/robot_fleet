import { mergeAlerts } from '@/features/alert/utils'
import { createEmptyRobot, type IRobot } from '@/model/robot'
import type { IFleetEvent, IFleetState } from '../types'

export type TFleetAction =
  | { type: 'event'; event: IFleetEvent }
  | { type: 'dismissAlert'; id: string }
  | { type: 'clearAlerts' }

export const initialFleetState: IFleetState = {
  robotsById: {},
  alerts: [],
  hasLoadedInitial: false,
}

function mergeRobot(
  robotsById: Record<string, IRobot>,
  robotId: string,
  patch: Partial<IRobot>
): Record<string, IRobot> {
  const base = robotsById[robotId] ?? createEmptyRobot(robotId)
  return { ...robotsById, [robotId]: { ...base, ...patch } }
}

function reduceEvent(state: IFleetState, event: IFleetEvent): IFleetState {
  switch (event.type) {
    case 'initial_robots': {
      const robotsById: Record<string, IRobot> = {}
      for (const robot of event.robots ?? []) {
        robotsById[robot.robotId] = robot
      }

      return {
        robotsById,
        alerts: mergeAlerts([], event.alerts ?? []),
        hasLoadedInitial: true,
      }
    }

    case 'robot_update': {
      if (!event.data) return state
      return {
        ...state,
        robotsById: mergeRobot(state.robotsById, event.data.robotId, event.data),
      }
    }

    case 'robot_connected': {
      if (!event.robotId) return state
      return {
        ...state,
        robotsById: mergeRobot(state.robotsById, event.robotId, {
          ...(event.data ?? {}),
          status: 'online',
        }),
      }
    }

    case 'robot_disconnected': {
      if (!event.robotId) return state
      return {
        ...state,
        robotsById: mergeRobot(state.robotsById, event.robotId, {
          ...(event.data ?? {}),
          status: 'offline',
        }),
      }
    }

    case 'alert': {
      if (!event.alert) return state
      return { ...state, alerts: mergeAlerts(state.alerts, [event.alert]) }
    }

    default:
      return state
  }
}

export function fleetReducer(
  state: IFleetState,
  action: TFleetAction
): IFleetState {
  switch (action.type) {
    case 'event':
      return reduceEvent(state, action.event)

    case 'dismissAlert':
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.id),
      }

    case 'clearAlerts':
      return { ...state, alerts: [] }

    default:
      return state
  }
}
