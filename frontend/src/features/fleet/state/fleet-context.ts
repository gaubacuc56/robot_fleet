'use client'

import { createContext } from 'react'

import type { IAlert } from '@/features/alert/types'
import type { TConnectionState } from '@/hooks/useWebSocket'
import type { IRobot } from '@/model/robot'

export interface IFleetContextValue {
  robots: IRobot[]
  robotsById: Record<string, IRobot>
  alerts: IAlert[]
  connectionState: TConnectionState
  isConnected: boolean
  hasLoadedInitial: boolean
  dismissAlert: (id: string) => void
  clearAlerts: () => void
}

export const FleetContext = createContext<IFleetContextValue | null>(null)
