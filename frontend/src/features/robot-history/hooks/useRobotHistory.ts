'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { config } from '@/config/env'
import { useRobot } from '@/features/fleet/hooks/useRobot'
import { ApiError } from '@/utils/api-client'
import { fetchRobotHistory } from '../api/FetchRobotHistory'
import type { IHistoryPoint, IHistoryWindow } from '../types'
import { toHistoryPoint, withinWindow } from '../utils'

export interface IUseRobotHistoryResult {
  points: IHistoryPoint[]
  loading: boolean
  error: string | null
  notFound: boolean
  reload: () => void
}

/**
 * History for one robot, kept current. (Q3-R3, Q3-R4)
 *   body  fetched once from the API, bucketed server-side
 *   tail  live points appended from the WebSocket stream at full 1 Hz
 */
export function useRobotHistory(
  robotId: string,
  options: IHistoryWindow = {}
): IUseRobotHistoryResult {
  const hours = options.hours ?? config.history.hours
  const bucketSeconds = options.bucketSeconds ?? config.history.bucketSeconds

  const [body, setBody] = useState<IHistoryPoint[]>([])
  const [tail, setTail] = useState<IHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  const robot = useRobot(robotId)
  const lastAppendedRef = useRef<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    setLoading(true)
    setError(null)
    setNotFound(false)

    fetchRobotHistory(robotId, {
      hours,
      bucketSeconds,
      signal: controller.signal,
    })
      .then((response) => {
        if (!active) return
        setBody(response.points)
        setTail([])
        lastAppendedRef.current = response.points.at(-1)?.timestamp ?? null
      })
      .catch((cause: unknown) => {
        if (!active || controller.signal.aborted) return
        if (cause instanceof ApiError && cause.status === 404) {
          setNotFound(true)
          return
        }
        setError(
          cause instanceof Error ? cause.message : 'Failed to load history'
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [robotId, hours, bucketSeconds, reloadToken])

  // Append each new live reading exactly once, keyed on its timestamp.
  useEffect(() => {
    if (!robot) return

    const point = toHistoryPoint(robot)
    if (!point) return
    if (lastAppendedRef.current === point.timestamp) return

    lastAppendedRef.current = point.timestamp
    setTail((current) => [...current, point])
  }, [robot])

  const points = useMemo(
    () => withinWindow([...body, ...tail], hours),
    [body, tail, hours]
  )

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return { points, loading, error, notFound, reload }
}
