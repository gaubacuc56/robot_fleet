import { API_PATHS } from '@/constants/api'
import type { IRobot } from '@/model/robot'
import { apiFetch } from '@/utils/api-client'

interface IFetchRobotsResponse {
  robots: IRobot[]
}

export async function fetchRobots(signal?: AbortSignal): Promise<IRobot[]> {
  const { robots } = await apiFetch<IFetchRobotsResponse>(API_PATHS.robots(), {
    signal,
  })
  return robots
}
