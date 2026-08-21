import { ThunderboltFilled } from '@ant-design/icons'
import { Tag } from 'antd'

import { EmptyValue } from '../EmptyValue'

export interface IChargingTagProps {
  isCharging: boolean | null
}

export function ChargingTag({ isCharging }: IChargingTagProps) {
  if (isCharging === null) return <EmptyValue />

  return isCharging ? (
    <Tag icon={<ThunderboltFilled />} color="gold" style={{ margin: 0 }}>
      Charging
    </Tag>
  ) : (
    <Tag color="default" style={{ margin: 0 }}>
      Discharging
    </Tag>
  )
}
