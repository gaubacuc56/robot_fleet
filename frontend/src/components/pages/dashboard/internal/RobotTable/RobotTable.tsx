'use client'

import { Empty, Table } from 'antd'
import { useRouter } from 'next/navigation'

import { ROUTES } from '@/constants/routes'
import type { IRobot } from '@/model/robot'
import { ROBOT_COLUMNS } from './columns'

export interface IRobotTableProps {
  robots: IRobot[]
  loading: boolean
}

/**
 * Robot list with all five metrics. (Q2-R1 to Q2-R3)
 *
 * Rows navigate to the detail page (Q3-R1) and are keyed by robotId, so React
 * reuses them across the 1 Hz updates instead of rebuilding the body.
 */
export function RobotTable({ robots, loading }: IRobotTableProps) {
  const router = useRouter()

  return (
    <Table<IRobot>
      rowKey="robotId"
      columns={ROBOT_COLUMNS}
      dataSource={robots}
      loading={loading}
      pagination={false}
      size="middle"
      scroll={{ x: 'max-content' }}
      onRow={(record) => ({
        onClick: () => router.push(ROUTES.robotDetail(record.robotId)),
        style: { cursor: 'pointer' },
      })}
      locale={{
        emptyText: (
          <Empty
            description={
              loading
                ? 'Waiting for the fleet…'
                : 'No robots yet. Start the simulator: cd backend && npm run simulator'
            }
          />
        ),
      }}
    />
  )
}
