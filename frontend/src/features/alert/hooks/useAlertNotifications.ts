'use client'

import { App } from 'antd'
import { useCallback, useRef } from 'react'

import { ALERT_TITLES, ALERT_TOAST_DURATION } from '../constants'
import type { IAlert } from '../types'

export interface IUseAlertNotificationsResult {
  notify: (alert: IAlert) => void
  suppress: (alerts: IAlert[]) => void
  arm: () => void
  disarm: () => void
}

/**
 * Transient toasts for incoming alerts. (Q2-R9)
 *
 * Only alerts that arrive while this tab is open are toasted. The ones replayed
 * on connect go to the panel instead, so a reconnect does not fire a burst of
 * notifications for conditions the user has already seen.
 */
export function useAlertNotifications(): IUseAlertNotificationsResult {
  const { notification } = App.useApp()

  const toastedRef = useRef<Set<string>>(new Set())
  const armedRef = useRef(false)

  const suppress = useCallback((alerts: IAlert[]) => {
    for (const alert of alerts) {
      toastedRef.current.add(alert.id)
    }
  }, [])

  const arm = useCallback(() => {
    armedRef.current = true
  }, [])

  const disarm = useCallback(() => {
    armedRef.current = false
  }, [])

  const notify = useCallback(
    (alert: IAlert) => {
      if (!armedRef.current || toastedRef.current.has(alert.id)) return
      toastedRef.current.add(alert.id)

      const kind = alert.severity === 'error' ? 'error' : 'warning'

      notification[kind]({
        key: alert.id,
        message: ALERT_TITLES[alert.severity],
        description: alert.message,
        placement: 'topRight',
        duration: ALERT_TOAST_DURATION[alert.severity],
      })
    },
    [notification]
  )

  return { notify, suppress, arm, disarm }
}
