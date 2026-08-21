export const ROUTES = {
  dashboard: '/',
  robotDetail: (robotId: string) => `/robots/${encodeURIComponent(robotId)}`,
} as const
