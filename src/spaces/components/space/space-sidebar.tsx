// path: src/components/Spaces/space/space-sidebar.tsx
'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { SpaceHeader } from './space-header'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SpaceSearch } from './space-search'
import { Separator } from '@/components/ui/separator'
import { SpaceSection } from './space-section'
import { SpaceChannel } from './space-channel'
import { SpaceMember } from './space-member'
import { ChannelType, MemberRole, ExtendedChannel, ExtendedMember } from '@/spaces/types'
import { Hash, Mic, ShieldCheck, Video, Loader2 } from 'lucide-react'
import { useAuth } from '@/providers/Auth'
import { Space } from '@/payload-types'
import { spaceService } from '@/spaces/services/spaceService.client'
import { getGravatarUrlOrNull } from '@/spaces/utilities/gravatar'

interface SpaceSidebarProps {
  spaceId: string
}

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4 text-zinc-300" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4 text-zinc-300" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4 text-zinc-300" />,
} as const

const roleIconMap = {
  [MemberRole.ADMIN]: <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />,
  [MemberRole.MODERATOR]: <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />,
  [MemberRole.MEMBER]: null,
} as const

export function SpaceSidebar({ spaceId }: SpaceSidebarProps): React.ReactElement {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [space, setSpace] = useState<Space | null>(null)
  const [members, setMembers] = useState<ExtendedMember[]>([])
  const [channels, setChannels] = useState<{
    text: ExtendedChannel[]
    audio: ExtendedChannel[]
    video: ExtendedChannel[]
  }>({
    text: [],
    audio: [],
    video: [],
  })

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    console.log('[SPACE_SIDEBAR] Rendering with:', { spaceId })

    const fetchData = async () => {
      if (!spaceId || !mounted || !user) return

      console.log('[SPACE_SIDEBAR] Data fetch starting:', { spaceId, userId: user.id })

      try {
        console.log('[SPACE_SIDEBAR] Fetching data...')
        const { space, members, channels } = await spaceService.getSpaceData(spaceId)

        console.log('[SPACE_SIDEBAR] Data received:', {
          hasSpace: !!space,
          memberCount: members?.length,
          channelCount: channels?.length,
          members: members?.map((m) => ({
            id: m.id,
            role: m.role,
            userId: typeof m.user === 'string' ? m.user : m.user?.id,
          })),
        })

        if (!mounted) return // Early return if unmounted

        setSpace(space)

        // Simple member transformation - filter out unpopulated users and log the issue
        const processedMembers = (members ?? [])
          .map((member) => {
            const userData =
              typeof member.user === 'string' ? null : (member.user as typeof member.user & { image?: { url?: string } })

            if (!userData) {
              console.warn('[SPACE_SIDEBAR] Member has no user data (unpopulated):', member.id)
              return null
            }

            // Create ExtendedMember with proper profile structure
            return {
              ...member,
              profile: {
                id: userData.id,
                name:
                  userData.name ||
                  `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
                  'Unknown User',
                email: userData.email || '',
                imageUrl:
                  (typeof userData.image === 'object' && userData.image?.url
                    ? userData.image.url
                    : null) || getGravatarUrlOrNull(userData.email, 80),
                userId: userData.id,
                createdAt: userData.createdAt || new Date().toISOString(),
                updatedAt: userData.updatedAt || new Date().toISOString(),
              },
            }
          })
          .filter(Boolean) as ExtendedMember[]

        setMembers(processedMembers)

        // Find current user's membership
        const currentUserMember = processedMembers.find((member) => {
          const userData = typeof member.user === 'string' ? null : member.user
          return userData?.id === user.id
        })

        if (currentUserMember) {
          console.log('[SPACE_SIDEBAR] Current user found in space:', {
            memberId: currentUserMember.id,
            role: currentUserMember.role,
            name: currentUserMember.profile.name,
          })
        } else {
          console.warn('[SPACE_SIDEBAR] Current user not found in space members')
        }

        const channelsData = {
          text: channels.filter((channel) => channel.type === ChannelType.TEXT),
          audio: channels.filter((channel) => channel.type === ChannelType.AUDIO),
          video: channels.filter((channel) => channel.type === ChannelType.VIDEO),
        }

        console.log('[SPACE_SIDEBAR] Channels after filtering:', {
          text: channelsData.text.length,
          audio: channelsData.audio.length,
          video: channelsData.video.length,
        })

        setChannels(
          channelsData as {
            text: ExtendedChannel[]
            audio: ExtendedChannel[]
            video: ExtendedChannel[]
          },
        )
        setLoading(false)
      } catch (error) {
        console.error('[SPACE_SIDEBAR] Error:', error)
        setLoading(false)
      }
    }

    void fetchData() // Handle the Promise
  }, [spaceId, mounted, user])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] h-full w-60 flex items-center justify-center">
        <Loader2 className="h-7 w-7 text-zinc-400 animate-spin my-4" />
      </div>
    )
  }

  if (!space || !user) {
    return <div>Loading...</div>
  }

  const currentMember = members.find((member) => {
    // Handle both string IDs and populated user objects
    if (typeof member.user === 'string') {
      return member.user === user.id
    }
    return member.user?.id === user.id
  })

  if (!currentMember) {
    return <div>Loading...</div>
  }

  const otherMembers = members.filter(
    (member) => typeof member.user !== 'string' && member.user.id !== user.id,
  )

  return (
    <div
      className="flex flex-col h-full w-full
      bg-gradient-to-br from-[#7364c0] to-[#02264a]
      dark:from-[#000C2F] dark:to-[#003666]
      border-r border-zinc-700/50"
    >
      <SpaceHeader space={space} role={currentMember.role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          <SpaceSearch
            data={[
              {
                label: 'Text Channels',
                type: 'channel',
                data: channels.text.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type as keyof typeof iconMap],
                })),
              },
              {
                label: 'Voice Channels',
                type: 'channel',
                data: channels.audio.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type as keyof typeof iconMap],
                })),
              },
              {
                label: 'Video Channels',
                type: 'channel',
                data: channels.video.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type as keyof typeof iconMap],
                })),
              },
              {
                label: 'Members',
                type: 'member',
                data: members.map((member) => ({
                  id: member.id,
                  name:
                    typeof member.user !== 'string'
                      ? member.user.name || `${member.user.firstName} ${member.user.lastName}`
                      : 'Unknown User',
                  icon: roleIconMap[member.role as keyof typeof roleIconMap],
                })),
              },
            ]}
          />
        </div>
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        {!!channels.text.length && (
          <div className="mb-2">
            <SpaceSection
              sectionType="channels"
              channelType={ChannelType.TEXT}
              role={currentMember.role}
              label="Text Channels"
              space={space}
            >
              <div className="space-y-[2px]">
                {channels.text.map((channel) => (
                  <SpaceChannel
                    key={channel.id}
                    channel={channel}
                    space={space}
                    role={currentMember.role}
                  />
                ))}
              </div>
            </SpaceSection>
          </div>
        )}
        {!!channels.audio.length && (
          <div className="mb-2">
            <SpaceSection
              sectionType="channels"
              channelType={ChannelType.AUDIO}
              role={currentMember.role}
              label="Voice Channels"
              space={space}
            >
              <div className="space-y-[2px]">
                {channels.audio.map((channel) => (
                  <SpaceChannel
                    key={channel.id}
                    channel={channel}
                    space={space}
                    role={currentMember.role}
                  />
                ))}
              </div>
            </SpaceSection>
          </div>
        )}
        {!!channels.video.length && (
          <div className="mb-2">
            <SpaceSection
              sectionType="channels"
              channelType={ChannelType.VIDEO}
              role={currentMember.role}
              label="Video Channels"
              space={space}
            >
              <div className="space-y-[2px]">
                {channels.video.map((channel) => (
                  <SpaceChannel
                    key={channel.id}
                    channel={channel}
                    space={space}
                    role={currentMember.role}
                  />
                ))}
              </div>
            </SpaceSection>
          </div>
        )}
        {!!members.length && (
          <div className="mb-2">
            <SpaceSection
              sectionType="members"
              role={currentMember.role}
              label="Members"
              space={space}
            >
              <div className="space-y-[2px]">
                {members.map((member) => {
                  if (typeof member.user === 'string') return null

                  // Get the user's display name with proper fallbacks
                  const displayName =
                    member.user.name ||
                    (member.user.firstName && member.user.lastName
                      ? `${member.user.firstName} ${member.user.lastName}`.trim()
                      : member.user.firstName || member.user.lastName || 'Unnamed User')

                  return (
                    <SpaceMember
                      key={member.id}
                      member={{
                        ...member,
                        user: {
                          ...member.user,
                          name: displayName,
                        },
                      }}
                      spaceId={spaceId}
                    />
                  )
                })}
              </div>
            </SpaceSection>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
