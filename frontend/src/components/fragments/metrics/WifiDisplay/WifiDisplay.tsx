import { ApiOutlined } from '@ant-design/icons'
import { Space, Typography } from 'antd'

import { EmptyValue } from '../EmptyValue'
import { WIFI_QUALITY_COLORS, toWifiQuality } from './utils'

const { Text } = Typography

export interface IWifiDisplayProps {
  value: number | null
}

export function WifiDisplay({ value }: IWifiDisplayProps) {
  if (value === null) return <EmptyValue />

  const quality = toWifiQuality(value)

  return (
    <Space size={4}>
      <ApiOutlined style={{ color: WIFI_QUALITY_COLORS[quality] }} />
      <Text>{value} dBm</Text>
      <Text type="secondary">({quality})</Text>
    </Space>
  )
}
