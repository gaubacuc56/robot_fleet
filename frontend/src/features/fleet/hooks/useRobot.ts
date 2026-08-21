'use client'

import type { IRobot } from '@/model/robot'
import { useFleet } from './useFleet'

export function useRobot(robotId: string): IRobot | undefined {
  const { robotsById } = useFleet()
  return robotsById[robotId]
}
