const DASHBOARD_SOCKET_PATH = '/dashboard'

function readPositiveNumber(raw: string | undefined, fallback: number): number {
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const websocketBaseUrl =
  process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080'

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '',

  websocketBaseUrl,
  dashboardSocketUrl: `${websocketBaseUrl}${DASHBOARD_SOCKET_PATH}`,

  history: {
    hours: readPositiveNumber(process.env.NEXT_PUBLIC_HISTORY_HOURS, 6),
    bucketSeconds: readPositiveNumber(
      process.env.NEXT_PUBLIC_HISTORY_BUCKET_SECONDS,
      30
    ),
  },
} as const
