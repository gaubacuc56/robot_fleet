'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type TConnectionState = 'connecting' | 'open' | 'closed'

export interface IUseWebSocketResult {
  connectionState: TConnectionState
  isConnected: boolean
}

export function useWebSocket<TMessage>(
  url: string,
  onMessage: (message: TMessage) => void,
  reconnectDelayMs = 3000
): IUseWebSocketResult {
  const [connectionState, setConnectionState] =
    useState<TConnectionState>('connecting')

  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closedByUsRef = useRef(false)

  const onMessageRef = useRef(onMessage)
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const connect = useCallback(() => {
    closedByUsRef.current = false
    setConnectionState('connecting')

    let socket: WebSocket
    try {
      socket = new WebSocket(url)
    } catch (error) {
      console.error('Failed to open WebSocket:', error)
      setConnectionState('closed')
      return
    }

    socketRef.current = socket

    socket.onopen = () => setConnectionState('open')

    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        onMessageRef.current(JSON.parse(event.data) as TMessage)
      } catch (error) {
        console.error('Dropping malformed message:', error)
      }
    }

    socket.onclose = () => {
      setConnectionState('closed')
      if (closedByUsRef.current) return

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null
        connect()
      }, reconnectDelayMs)
    }
  }, [url, reconnectDelayMs])

  useEffect(() => {
    connect()

    return () => {
      closedByUsRef.current = true
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      socketRef.current?.close()
      socketRef.current = null
    }
  }, [connect])

  return { connectionState, isConnected: connectionState === 'open' }
}
