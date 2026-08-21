import { API_PATHS } from '@/constants/api'
import type { IRobot } from '@/model/robot'
import { apiFetch } from '@/utils/api-client'

interface IFetchRobotResponse {
  robot: IRobot
}

export async function fetchRobot(
  robotId: string,
  signal?: AbortSignal
): Promise<IRobot> {
  const { robot } = await apiFetch<IFetchRobotResponse>(
    API_PATHS.robot(robotId),
    { signal }
  )
  return robot
}
