'use client'

import { Col, Row, Space, Typography } from 'antd'

import { config } from '@/config/env'
import { AlertPanel } from '@/features/alert/components/AlertPanel'
import { useFleet } from '@/features/fleet/hooks/useFleet'
import { FleetSummary } from './internal/FleetSummary'
import { RobotTable } from './internal/RobotTable'

const { Title, Text } = Typography

/**
 * Main dashboard. (Q2) No polling and no refresh button — every value arrives
 * over the WebSocket, from the shared FleetProvider stream.
 */
export function Dashboard() {
  const {
    robots,
    alerts,
    connectionState,
    hasLoadedInitial,
    dismissAlert,
    clearAlerts,
  } = useFleet()

  const isWaitingForFleet = !hasLoadedInitial && connectionState !== 'closed'

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Title level={4} style={{ marginBottom: 0 }}>
          Fleet overview
        </Title>
        <Text type="secondary">
          Click a robot to see its {config.history.hours}-hour history.
        </Text>
      </div>

      <FleetSummary robots={robots} connectionState={connectionState} />

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={17}>
          <RobotTable robots={robots} loading={isWaitingForFleet} />
        </Col>
        <Col xs={24} xl={7}>
          <AlertPanel
            alerts={alerts}
            onDismiss={dismissAlert}
            onClear={clearAlerts}
          />
        </Col>
      </Row>
    </Space>
  )
}
