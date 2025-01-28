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
  const [token, setToken] = useState('')

  useEffect(() => {
    if (!user) return

    // Get user display name with fallbacks
    const displayName =
      user.name || // Try name first
      `${user.firstName || ''} ${user.lastName || ''}`.trim() || // Then first+last
      user.email?.split('@')[0] || // Then email username
      user.id // Finally, use ID as last resort

    const getToken = async () => {
      try {
        const response = await fetch(
          `/api/livekit?room=${chatId}&username=${encodeURIComponent(displayName)}`,
        )
        const data = await response.json()
        setToken(data.token.toString())
      } catch (error) {
        console.error('LiveKit token error:', error)
      }
    }

    getToken()
  }, [user, chatId])

  if (!token) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    )
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  )
}
