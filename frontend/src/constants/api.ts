export const API_PATHS = {
  robots: () => '/api/robots',
  robot: (robotId: string) => `/api/robots/${encodeURIComponent(robotId)}`,
  robotHistory: (robotId: string) =>
    `/api/robots/${encodeURIComponent(robotId)}/history`,
} as const
