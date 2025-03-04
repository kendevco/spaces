'use client'

import { useEffect, useState } from 'react'
import { LiveKitRoom, VideoConference } from '@livekit/components-react'
import '@livekit/components-styles'
import { useUser } from '@/spaces/hooks/use-user'
import { Loader2 } from 'lucide-react'
import type { User } from '@/payload-types'

interface MediaRoomProps {
  chatId: string
  video: boolean
  audio: boolean
}

export const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
  const { user } = useUser()
  const [token, setToken] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    // Get user display name with fallbacks
    const displayName = getDisplayName(user)

    const connectToRoom = async () => {
      try {
        console.log('[LIVEKIT] Connecting to room:', {
          chatId,
          displayName,
          hasUser: !!user,
        })

        const response = await fetch(
          `/api/livekit?room=${chatId}&username=${encodeURIComponent(displayName)}`,
        )

        if (!response.ok) {
          const error = await response.text()
          throw new Error(error || `Failed to get token: ${response.status}`)
        }

        // Get token as plain text
        const token = await response.text()

        if (!token) {
          throw new Error('No token received from server')
        }

        console.log('[LIVEKIT] Got token:', {
          tokenLength: token.length,
          tokenStart: token.substring(0, 10) + '...',
        })

        setToken(token)
        setError(null)
      } catch (error) {
        console.error('[LIVEKIT] Token error:', error)
        setError((error as Error).message)
      }
    }

    connectToRoom()
  }, [user, chatId])

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL
  if (!serverUrl) {
    console.error('[LIVEKIT] Missing NEXT_PUBLIC_LIVEKIT_URL')
    return null
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center h-full">
        <p className="text-xs text-rose-500">Error: {error}</p>
      </div>
    )
  }

  // Show loading state while waiting for token
  if (token === '') {
    return (
      <div className="flex flex-col flex-1 justify-center items-center h-full">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading media room...</p>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <style jsx global>{`
        /* Full height container, no overflow */
        .lk-video-conference {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          height: 100% !important;
          width: 100% !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        }

        /* Make grid fill available space */
        .lk-grid-layout {
          flex: 1 !important;
          height: 100% !important;
          max-height: calc(100% - 60px) !important;
        }

        /* Position controls at bottom */
        .lk-control-bar {
          position: absolute !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          background: rgba(0, 0, 0, 0.5) !important;
          z-index: 10 !important;
        }

        /* Fix video container sizing */
        .lk-participant {
          height: 100% !important;
        }

        /* Video element full height/width */
        video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
      <LiveKitRoom
        data-lk-theme="default"
        serverUrl={serverUrl}
        token={token}
        connect={true}
        video={video}
        audio={audio}
        className="h-full w-full"
      >
        <VideoConference className="h-full w-full" />
      </LiveKitRoom>
    </div>
  )
}

// Helper function to get display name from Payload User
function getDisplayName(user: User): string {
  return (
    user.name || // Try name first
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || // Then first+last
    user.email?.split('@')[0] || // Then email username
    user.id // Finally, use ID as last resort
  )
}
