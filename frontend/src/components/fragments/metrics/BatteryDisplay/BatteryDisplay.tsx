import { ThunderboltFilled } from '@ant-design/icons'
import { Progress, Space, Tooltip } from 'antd'

import { BATTERY_THRESHOLDS } from '@/constants/metrics'
import { COLORS } from '@/constants/ui'
import { formatDecimal } from '@/utils/format'
import { EmptyValue } from '../EmptyValue'

export interface IBatteryDisplayProps {
  value: number | null
  isCharging: boolean | null
}

export function BatteryDisplay({ value, isCharging }: IBatteryDisplayProps) {
  if (value === null) return <EmptyValue />

  const isLow = value < BATTERY_THRESHOLDS.low
  const strokeColor = isLow
    ? isCharging
      ? COLORS.warning
      : COLORS.error
    : COLORS.success

  return (
    <Space size={4} style={{ width: '100%' }}>
      <Progress
        percent={value}
        size="small"
        strokeColor={strokeColor}
        format={(percent) => formatDecimal(percent ?? 0, '%')}
        style={{ minWidth: 120, marginBottom: 0 }}
      />
      {isCharging === true && (
        <Tooltip title="Charging">
          <ThunderboltFilled style={{ color: COLORS.warning }} />
        </Tooltip>
      )}
    </Space>
  )
}
