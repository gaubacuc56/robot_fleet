import { Typography } from 'antd'

import { EMPTY_VALUE } from '@/constants/ui'

const { Text } = Typography

export function EmptyValue() {
  return <Text type="secondary">{EMPTY_VALUE}</Text>
}
