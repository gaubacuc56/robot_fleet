import { config } from '@/config/env'
import { API_PATHS } from '@/constants/api'
import { apiFetch } from '@/utils/api-client'
import type { IHistoryPoint, IHistoryWindow } from '../types'

export interface IFetchRobotHistoryResponse {
  robotId: string
  from: string
  to: string
  hours: number
  bucketSeconds: number
  points: IHistoryPoint[]
}

export function fetchRobotHistory(
  robotId: string,
  options: IHistoryWindow & { signal?: AbortSignal } = {}
): Promise<IFetchRobotHistoryResponse> {
  return apiFetch<IFetchRobotHistoryResponse>(API_PATHS.robotHistory(robotId), {
    params: {
      hours: options.hours ?? config.history.hours,
      bucketSeconds: options.bucketSeconds ?? config.history.bucketSeconds,
    },
    signal: options.signal,
  })
}
