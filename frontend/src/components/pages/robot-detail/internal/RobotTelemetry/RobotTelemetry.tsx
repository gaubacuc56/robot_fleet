'use client'

import { Card, Descriptions, Spin, Typography } from 'antd'

import { BatteryDisplay } from '@/components/fragments/metrics/BatteryDisplay'
import { ChargingTag } from '@/components/fragments/metrics/ChargingTag'
import { MemoryDisplay } from '@/components/fragments/metrics/MemoryDisplay'
import { StatusTag } from '@/components/fragments/metrics/StatusTag'
import { TemperatureDisplay } from '@/components/fragments/metrics/TemperatureDisplay'
import { WifiDisplay } from '@/components/fragments/metrics/WifiDisplay'
import type { IRobot } from '@/model/robot'
import { formatDateTime } from '@/utils/format'

const { Text } = Typography

export interface IRobotTelemetryProps {
  robot: IRobot | undefined
  isLoading: boolean
}

export function RobotTelemetry({ robot, isLoading }: IRobotTelemetryProps) {
  return (
    <Card size="small" title="Current telemetry">
      {robot ? (
        <Descriptions
          column={{ xs: 1, sm: 2, lg: 3 }}
          size="small"
          items={[
            {
              key: 'status',
              label: 'Status',
              children: <StatusTag status={robot.status} />,
            },
            {
              key: 'battery',
              label: 'Battery',
              children: (
                <BatteryDisplay
                  value={robot.batteryPercentage}
                  isCharging={robot.isCharging}
                />
              ),
            },
            {
              key: 'charging',
              label: 'Charging',
              children: <ChargingTag isCharging={robot.isCharging} />,
            },
            {
              key: 'wifi',
              label: 'WiFi',
              children: <WifiDisplay value={robot.wifiSignalStrength} />,
            },
            {
              key: 'temperature',
              label: 'Temperature',
              children: <TemperatureDisplay value={robot.temperature} />,
            },
            {
              key: 'memory',
              label: 'Memory',
              children: <MemoryDisplay value={robot.memoryUsage} />,
            },
            {
              key: 'lastSeen',
              label: 'Last seen',
              children: (
                <Text type="secondary">{formatDateTime(robot.lastSeen)}</Text>
              ),
            },
          ]}
        />
      ) : isLoading ? (
        <Spin />
      ) : (
        <Text type="secondary">
          This robot has stored history but is not currently reporting.
        </Text>
      )}
    </Card>
  )
}
