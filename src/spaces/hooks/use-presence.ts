import { useEffect, useState } from 'react'
import { useSocket } from '../services/socket/socket-provider'

interface UsePresenceProps {
  spaceId: string
  userId: string
  enabled?: boolean
}

interface UsePresenceReturn {
  isOnline: boolean | null
  lastSeen: Date | null
  error: Error | null
}

/**
 * Hook to manage user presence in a space
 * @param {UsePresenceProps} props - Properties for presence tracking
 * @returns {UsePresenceReturn} Object containing presence state
 */
export const usePresence = ({ spaceId, userId, enabled = true }: UsePresenceProps): UsePresenceReturn => {
  const { socket } = useSocket()
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [lastSeen, setLastSeen] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!socket || !enabled || !spaceId || !userId) return

    // Join space presence channel
    socket.emit('presence:join', { spaceId, userId })

    // Listen for presence updates
    socket.on('presence:update', (data: { userId: string; isOnline: boolean; lastSeen: string }) => {
      if (data.userId === userId) {
        setIsOnline(data.isOnline)
        setLastSeen(new Date(data.lastSeen))
      }
    })

    return () => {
      socket.emit('presence:leave', { spaceId, userId })
      socket.off('presence:update')
    }
  }, [socket, spaceId, userId, enabled])

  return { isOnline, lastSeen, error }
}
