import dayjs from 'dayjs'

import { EMPTY_VALUE } from '@/constants/ui'

export function formatTime(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleTimeString() : EMPTY_VALUE
}

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleString() : EMPTY_VALUE
}

export function formatAxisTime(iso: string): string {
  return dayjs(iso).format('HH:mm')
}

export function formatTooltipTime(iso: string): string {
  return dayjs(iso).format('DD MMM HH:mm:ss')
}

export function formatDecimal(value: number, unit = ''): string {
  return `${value.toFixed(1)}${unit}`
}
