import { Typography } from 'antd'

import { TEMPERATURE_THRESHOLDS } from '@/constants/metrics'
import { COLORS } from '@/constants/ui'
import { formatDecimal } from '@/utils/format'
import { EmptyValue } from '../EmptyValue'

const { Text } = Typography

export interface ITemperatureDisplayProps {
  value: number | null
}

export function TemperatureDisplay({ value }: ITemperatureDisplayProps) {
  if (value === null) return <EmptyValue />

  const color =
    value >= TEMPERATURE_THRESHOLDS.critical
      ? COLORS.error
      : value >= TEMPERATURE_THRESHOLDS.warning
        ? COLORS.warning
        : undefined

  return <Text style={{ color }}>{formatDecimal(value, ' °C')}</Text>
}
