import { Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import { BatteryDisplay } from '@/components/fragments/metrics/BatteryDisplay'
import { ChargingTag } from '@/components/fragments/metrics/ChargingTag'
import { MemoryDisplay } from '@/components/fragments/metrics/MemoryDisplay'
import { StatusTag } from '@/components/fragments/metrics/StatusTag'
import { TemperatureDisplay } from '@/components/fragments/metrics/TemperatureDisplay'
import { WifiDisplay } from '@/components/fragments/metrics/WifiDisplay'
import type { IRobot } from '@/model/robot'
import { formatTime } from '@/utils/format'

const { Text } = Typography

function byNumber(
  pick: (robot: IRobot) => number | null,
  nullValue: number
): (a: IRobot, b: IRobot) => number {
  return (a, b) => (pick(a) ?? nullValue) - (pick(b) ?? nullValue)
}

export const ROBOT_COLUMNS: ColumnsType<IRobot> = [
  {
    title: 'Robot',
    dataIndex: 'robotId',
    key: 'robotId',
    width: 110,
    sorter: (a, b) => a.robotId.localeCompare(b.robotId),
    defaultSortOrder: 'ascend',
    render: (robotId: string) => <Text strong>{robotId}</Text>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 110,
    filters: [
      { text: 'Online', value: 'online' },
      { text: 'Offline', value: 'offline' },
    ],
    onFilter: (value, record) => record.status === value,
    render: (_, record) => <StatusTag status={record.status} />,
  },
  {
    title: 'Battery',
    dataIndex: 'batteryPercentage',
    key: 'batteryPercentage',
    width: 200,
    sorter: byNumber((robot) => robot.batteryPercentage, -1),
    render: (_, record) => (
      <BatteryDisplay
        value={record.batteryPercentage}
        isCharging={record.isCharging}
      />
    ),
  },
  {
    title: 'Charging',
    dataIndex: 'isCharging',
    key: 'isCharging',
    width: 140,
    render: (_, record) => <ChargingTag isCharging={record.isCharging} />,
  },
  {
    title: 'WiFi',
    dataIndex: 'wifiSignalStrength',
    key: 'wifiSignalStrength',
    width: 180,
    sorter: byNumber((robot) => robot.wifiSignalStrength, -999),
    render: (_, record) => <WifiDisplay value={record.wifiSignalStrength} />,
  },
  {
    title: 'Temperature',
    dataIndex: 'temperature',
    key: 'temperature',
    width: 130,
    sorter: byNumber((robot) => robot.temperature, -999),
    render: (_, record) => <TemperatureDisplay value={record.temperature} />,
  },
  {
    title: 'Memory',
    dataIndex: 'memoryUsage',
    key: 'memoryUsage',
    width: 120,
    sorter: byNumber((robot) => robot.memoryUsage, -1),
    render: (_, record) => <MemoryDisplay value={record.memoryUsage} />,
  },
  {
    title: 'Last seen',
    dataIndex: 'lastSeen',
    key: 'lastSeen',
    width: 120,
    render: (lastSeen: string | null) => (
      <Text type="secondary">{formatTime(lastSeen)}</Text>
    ),
  },
]
