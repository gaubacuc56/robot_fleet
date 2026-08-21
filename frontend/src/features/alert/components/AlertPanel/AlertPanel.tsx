'use client'

import {
  Alert as AntAlert,
  Badge,
  Button,
  Card,
  Empty,
  List,
  Space,
  Typography,
} from 'antd'

import { COLORS } from '@/constants/ui'
import { formatTime } from '@/utils/format'
import { countBySeverity } from '../../utils'
import type { IAlert } from '../../types'

const { Text } = Typography

export interface IAlertPanelProps {
  alerts: IAlert[]
  onDismiss: (id: string) => void
  onClear: () => void
}

/**
 * Standing list of active alerts. (Q2-R6, Q2-R9)
 *
 * Toasts are transient; this panel is what keeps an alert discoverable a minute
 * later, and what a reconnect repopulates from the replayed state.
 */
export function AlertPanel({ alerts, onDismiss, onClear }: IAlertPanelProps) {
  const { errors, warnings } = countBySeverity(alerts)

  return (
    <Card
      size="small"
      style={{ height: '100%' }}
      title={
        <Space>
          <Text strong>Alerts</Text>
          {warnings > 0 && <Badge count={warnings} color={COLORS.warning} />}
          {errors > 0 && <Badge count={errors} color={COLORS.error} />}
        </Space>
      }
      extra={
        alerts.length > 0 && (
          <Button type="link" size="small" onClick={onClear}>
            Clear all
          </Button>
        )
      }
    >
      {alerts.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No active alerts"
        />
      ) : (
        <List
          size="small"
          dataSource={alerts}
          style={{ maxHeight: 320, overflowY: 'auto' }}
          renderItem={(alert) => (
            <List.Item style={{ padding: '4px 0', border: 'none' }}>
              <AntAlert
                type={alert.severity === 'error' ? 'error' : 'warning'}
                showIcon
                closable
                onClose={() => onDismiss(alert.id)}
                style={{ width: '100%' }}
                message={alert.message}
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatTime(alert.timestamp)}
                    {alert.type === 'critical_battery' &&
                      ' · shutdown imminent'}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}
