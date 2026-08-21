import { DashboardOutlined } from '@ant-design/icons'
import { Space, Typography } from 'antd'

import { MEMORY_THRESHOLDS } from '@/constants/metrics'
import { COLORS } from '@/constants/ui'
import { EmptyValue } from '../EmptyValue'

const { Text } = Typography

export interface IMemoryDisplayProps {
  value: number | null
}

export function MemoryDisplay({ value }: IMemoryDisplayProps) {
  if (value === null) return <EmptyValue />

  const color =
    value >= MEMORY_THRESHOLDS.critical
      ? COLORS.error
      : value >= MEMORY_THRESHOLDS.warning
        ? COLORS.warning
        : COLORS.success

  return (
    <Space size={4}>
      <DashboardOutlined style={{ color }} />
      <Text>{value}%</Text>
    </Space>
  )
}
