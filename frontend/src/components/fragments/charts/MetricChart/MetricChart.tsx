'use client'

import { Card, Empty } from 'antd'
import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { COLORS } from '@/constants/ui'
import { formatAxisTime, formatTooltipTime } from '@/utils/format'
import type { IMetricChartProps } from './types'
import { toChargingBands } from './utils'

/**
 * One metric over time. (Q3-R3)
 *
 * The Y domain is fixed for metrics with a natural range, because auto-scaling
 * makes a 2% battery dip look like a cliff. Dots are off: at several hundred
 * points they merge into a solid band.
 */
export function MetricChart({
  title,
  points,
  dataKey,
  color,
  unit,
  domain,
  threshold,
  showChargingBands = false,
  height = 220,
}: IMetricChartProps) {
  const bands = useMemo(
    () => (showChargingBands ? toChargingBands(points) : []),
    [points, showChargingBands]
  )

  return (
    <Card size="small" title={title} style={{ height: '100%' }}>
      {points.length === 0 ? (
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No data in this window yet"
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={points}
            margin={{ top: 4, right: 12, bottom: 0, left: -12 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />

            {/* Charging periods, so the battery curve's rises are explained. */}
            {bands.map(([from, to]) => (
              <ReferenceArea
                key={`${from}-${to}`}
                x1={from}
                x2={to}
                fill={COLORS.warning}
                fillOpacity={0.12}
                ifOverflow="extendDomain"
              />
            ))}

            <XAxis
              dataKey="timestamp"
              tickFormatter={formatAxisTime}
              minTickGap={40}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              domain={domain ?? ['auto', 'auto']}
              tick={{ fontSize: 11 }}
              width={48}
              tickFormatter={(value: number) =>
                `${value}${unit === '%' ? '%' : ''}`
              }
            />

            {threshold !== undefined && (
              <ReferenceLine
                y={threshold}
                stroke={COLORS.error}
                strokeDasharray="4 4"
                label={{
                  value: `${threshold}${unit}`,
                  fontSize: 10,
                  fill: COLORS.error,
                  position: 'right',
                }}
              />
            )}

            <Tooltip
              labelFormatter={formatTooltipTime}
              formatter={(value: number) => [`${value}${unit}`, title]}
              contentStyle={{ fontSize: 12 }}
            />

            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
