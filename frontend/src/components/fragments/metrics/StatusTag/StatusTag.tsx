import { Tag } from 'antd'

import type { TRobotStatus } from '@/model/robot'

export interface IStatusTagProps {
  status: TRobotStatus
}

export function StatusTag({ status }: IStatusTagProps) {
  const isOnline = status === 'online'

  return (
    <Tag color={isOnline ? 'green' : 'default'} style={{ margin: 0 }}>
      {isOnline ? 'ONLINE' : 'OFFLINE'}
    </Tag>
  )
}
