'use client'

import { ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Col, Row, Space, Spin, Typography } from 'antd'

import { MetricChart } from '@/components/fragments/charts/MetricChart'
import { config } from '@/config/env'
import type { IHistoryPoint } from '@/features/robot-history/types'
import { HISTORY_CHARTS } from './chart-config'

const { Text } = Typography

export interface IRobotHistoryChartsProps {
  points: IHistoryPoint[]
  loading: boolean
  error: string | null
  onReload: () => void
}

export function RobotHistoryCharts({
  points,
  loading,
  error,
  onReload,
}: IRobotHistoryChartsProps) {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {error && (
        <Alert
          type="error"
          showIcon
          message="Could not load history"
          description={error}
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={onReload}>
              Retry
            </Button>
          }
        />
      )}

      <Space align="center" wrap>
        <Text strong>Last {config.history.hours} hours</Text>
        {loading && <Spin size="small" />}
      </Space>

      <Row gutter={[16, 16]}>
        {HISTORY_CHARTS.map((chart) => (
          <Col key={chart.dataKey} xs={24} xl={12}>
            <MetricChart {...chart} points={points} />
          </Col>
        ))}
      </Row>

      {!loading && !error && points.length === 0 && (
        <Alert
          type="info"
          showIcon
          message="No history in this window yet"
          description={`Charts fill in as telemetry arrives. A freshly started system has no ${config.history.hours} hours of data.`}
        />
      )}
    </Space>
  )
}
