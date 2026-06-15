import { useEffect, useRef } from 'react'

export function useWebSocket(token, onMessage) {
  const wsRef = useRef(null)

  useEffect(() => {
    if (!token) return

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url   = `${proto}//${window.location.host}/api/notify/ws?token=${token}`

    const connect = () => {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen    = () => console.log('[WS] connected')
      ws.onmessage = (e) => onMessage(e.data)
      ws.onerror   = (e) => console.warn('[WS] error', e)
      ws.onclose   = (e) => {
        if (e.code !== 1000) {
          // reconnect after 3s unless intentionally closed
          setTimeout(connect, 3000)
        }
      }
    }

    connect()
    return () => {
      wsRef.current?.close(1000, 'unmount')
    }
  }, [token])
}
