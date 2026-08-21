'use client'

import { Badge, Card, Space, Typography } from 'antd'

import type { TConnectionState } from '@/hooks/useWebSocket'
import type { IRobot } from '@/model/robot'

const { Text } = Typography

const CONNECTION_BADGE: Record<
  TConnectionState,
  { status: 'success' | 'processing' | 'error'; label: string }
> = {
  open: { status: 'success', label: 'Live' },
  connecting: { status: 'processing', label: 'Connecting…' },
  closed: { status: 'error', label: 'Disconnected' },
}

export interface IFleetSummaryProps {
  robots: IRobot[]
  connectionState: TConnectionState
}

export function FleetSummary({ robots, connectionState }: IFleetSummaryProps) {
  const online = robots.filter((robot) => robot.status === 'online').length
  const badge = CONNECTION_BADGE[connectionState]

  return (
    <Card size="small">
      <Space size="large" wrap>
        <Badge status={badge.status} text={badge.label} />
        <Text type="secondary">
          {online} of {robots.length} robots online
        </Text>
      </Space>
    </Card>
  )
}
