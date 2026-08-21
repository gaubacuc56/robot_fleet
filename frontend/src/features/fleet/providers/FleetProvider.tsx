'use client'

import { useCallback, useEffect, useMemo, useReducer } from 'react'

import { config } from '@/config/env'
import { useAlertNotifications } from '@/features/alert/hooks/useAlertNotifications'
import { useWebSocket } from '@/hooks/useWebSocket'
import { FleetContext, type IFleetContextValue } from '../state/fleet-context'
import { fleetReducer, initialFleetState } from '../state/fleet-reducer'
import type { IFleetEvent } from '../types'

/**
 * Owns the single dashboard WebSocket and the live fleet state. (Q2-R4)
 *
 * It sits above every page so they all read the same stream, and so navigating
 * between the dashboard and a detail page does not drop and reopen the socket.
 */
export function FleetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(fleetReducer, initialFleetState)
  const { notify, suppress, arm, disarm } = useAlertNotifications()

  const handleEvent = useCallback(
    (event: IFleetEvent) => {
      dispatch({ type: 'event', event })

      if (event.type === 'initial_robots') {
        // Replayed alerts belong in the panel, not in a burst of toasts.
        suppress(event.alerts ?? [])
        arm()
        return
      }

      if (event.type === 'alert' && event.alert) {
        notify(event.alert)
      }
    },
    [arm, notify, suppress]
  )

  const { connectionState, isConnected } = useWebSocket<IFleetEvent>(
    config.dashboardSocketUrl,
    handleEvent
  )

  // A dropped socket means the suppressed set is stale; allow toasts again only
  // after the next initial_robots has told us what is still active.
  useEffect(() => {
    if (connectionState === 'closed') disarm()
  }, [connectionState, disarm])

  const robots = useMemo(
    () =>
      Object.values(state.robotsById).sort((a, b) =>
        a.robotId.localeCompare(b.robotId)
      ),
    [state.robotsById]
  )

  const dismissAlert = useCallback(
    (id: string) => dispatch({ type: 'dismissAlert', id }),
    []
  )

  const clearAlerts = useCallback(() => dispatch({ type: 'clearAlerts' }), [])

  const value = useMemo<IFleetContextValue>(
    () => ({
      robots,
      robotsById: state.robotsById,
      alerts: state.alerts,
      connectionState,
      isConnected,
      hasLoadedInitial: state.hasLoadedInitial,
      dismissAlert,
      clearAlerts,
    }),
    [
      robots,
      state.robotsById,
      state.alerts,
      state.hasLoadedInitial,
      connectionState,
      isConnected,
      dismissAlert,
      clearAlerts,
    ]
  )

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>
}
