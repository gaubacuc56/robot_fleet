'use client'

import { useContext } from 'react'

import { FleetContext, type IFleetContextValue } from '../state/fleet-context'

export function useFleet(): IFleetContextValue {
  const context = useContext(FleetContext)
  if (!context) {
    throw new Error('useFleet must be used inside a FleetProvider')
  }
  return context
}
