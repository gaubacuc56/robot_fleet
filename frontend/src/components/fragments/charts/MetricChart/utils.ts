import type { IHistoryPoint } from '@/features/robot-history/types'
import type { TChargingBand } from './types'

export function toChargingBands(points: IHistoryPoint[]): TChargingBand[] {
  const bands: TChargingBand[] = []
  let start: string | null = null

  for (let i = 0; i < points.length; i += 1) {
    const point = points[i]

    if (point.isCharging && start === null) {
      start = point.timestamp
    } else if (!point.isCharging && start !== null) {
      bands.push([start, points[i - 1]?.timestamp ?? point.timestamp])
      start = null
    }
  }

  // Still charging at the right edge of the window.
  if (start !== null) {
    bands.push([start, points[points.length - 1].timestamp])
  }

  return bands
}
