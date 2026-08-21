'use client'

import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Space, Spin, Tag, Typography } from 'antd'
import Link from 'next/link'

import { StatusTag } from '@/components/fragments/metrics/StatusTag'
import { ROUTES } from '@/constants/routes'
import { useFleet } from '@/features/fleet/hooks/useFleet'
import { useRobot } from '@/features/fleet/hooks/useRobot'
import { useRobotHistory } from '@/features/robot-history/hooks/useRobotHistory'
import { RobotHistoryCharts } from './internal/RobotHistoryCharts'
import { RobotNotFound } from './internal/RobotNotFound'
import { RobotTelemetry } from './internal/RobotTelemetry'

const { Title } = Typography

export interface IRobotDetailProps {
  robotId: string
}

/**
 * Robot detail page. (Q3)
 *
 * Live status and current values come from the shared fleet stream; the charts
 * come from the history endpoint and are then extended by that same stream.
 */
export function RobotDetail({ robotId }: IRobotDetailProps) {
  const { hasLoadedInitial, connectionState } = useFleet()
  const robot = useRobot(robotId)
  const { points, loading, error, notFound, reload } = useRobotHistory(robotId)

  if (notFound && !robot) {
    return <RobotNotFound robotId={robotId} />
  }

  const isWaitingForFleet =
    !robot && !hasLoadedInitial && connectionState !== 'closed'

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Space align="center" wrap>
        <Link href={ROUTES.dashboard}>
          <Button icon={<ArrowLeftOutlined />}>Dashboard</Button>
        </Link>
        <Title level={4} style={{ margin: 0 }}>
          Robot {robotId}
        </Title>
        {robot ? (
          <StatusTag status={robot.status} />
        ) : isWaitingForFleet ? (
          <Spin size="small" />
        ) : (
          <Tag>UNKNOWN</Tag>
        )}
      </Space>

      <RobotTelemetry robot={robot} isLoading={isWaitingForFleet} />

      <RobotHistoryCharts
        points={points}
        loading={loading}
        error={error}
        onReload={reload}
      />
    </Space>
  )
}
