import { createContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../hooks/useAuth'

export const SocketContext = createContext({
  socket: null,
  connected: false,
})

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { session } = useAuth()

  useEffect(() => {
    // 로그인한 경우에만 소켓 연결
    if (session?.access_token) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: session.access_token
        },
        transports: ['websocket', 'polling'],
      })

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id)
        setConnected(true)
      })

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason)
        setConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [session?.access_token])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}
