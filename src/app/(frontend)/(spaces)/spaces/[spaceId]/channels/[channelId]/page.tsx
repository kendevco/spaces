// path: src/app/(spaces)/spaces/[spaceId]/channels/[channelId]/page.tsx

import { Metadata } from 'next'
import { ChatHeader } from '@/spaces/components/chat/chat-header'
import { ChatInput } from '@/spaces/components/chat/chat-input'
import { ChatMessages } from '@/spaces/components/chat/chat-messages'
import { MediaRoom } from '@/spaces/components/media-room'
import { getCurrentUser } from '@/spaces/utilities/payload/getCurrentUser.server'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { redirect } from 'next/navigation'
import type { ExtendedMember } from '@/spaces/types'
import { MemberRole, ChannelType } from '@/spaces/types'
import { JoinSpaceButton } from '@/spaces/components/space/join-space-button'
import Link from 'next/link'

type Params = Promise<{ channelId: string; spaceId: string }>

interface ChannelIdPageProps {
  params: Params
}

export async function generateMetadata({ params }: ChannelIdPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const { channelId, spaceId } = resolvedParams

  const payload = await getPayloadClient()
  const channelResult = await payload.find({
    collection: 'channels',
    where: { id: { equals: channelId } },
    depth: 2,
  })

  const channel = channelResult.docs[0]

  const spaceName = typeof channel?.space === 'string' ? '' : channel?.space?.name
  return {
    title: channel ? `#${channel.name} - ${spaceName}` : 'Channel',
  }
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const resolvedParams = await params
  const { channelId, spaceId } = resolvedParams

  console.log(`[CHANNEL_PAGE] Starting load for spaceId=${spaceId}, channelId=${channelId}`)

  // Get the authenticated user using server-side auth
  const user = await getCurrentUser()
  console.log(`[CHANNEL_PAGE] User check:`, {
    isAuthenticated: !!user,
    userId: user?.id,
    email: user?.email,
  })

  if (!user?.id) {
    console.log(`[CHANNEL_PAGE] No authenticated user, redirecting to login`)
    return redirect(
      `/login?redirect=${encodeURIComponent(`/spaces/${spaceId}/channels/${channelId}`)}`,
    )
  }

  const payload = await getPayloadClient()

  // Fetch space data
  console.log(`[CHANNEL_PAGE] Fetching space data for ${spaceId}`)
  try {
    const spaceResult = await payload.find({
      collection: 'spaces',
      where: { id: { equals: spaceId } },
      depth: 1,
    })

    const space = spaceResult.docs[0]
    console.log(`[CHANNEL_PAGE] Space found:`, {
      exists: !!space,
      name: space?.name,
      totalDocs: spaceResult.totalDocs,
    })

    if (!space) {
      console.log(`[CHANNEL_PAGE] Space not found, redirecting`)
      return redirect('/spaces')
    }

    // Fetch channel data
    console.log(`[CHANNEL_PAGE] Fetching channel data for ${channelId}`)
    const channelResult = await payload.find({
      collection: 'channels',
      where: { id: { equals: channelId } },
      depth: 1,
    })

    const channel = channelResult.docs[0]
    console.log(`[CHANNEL_PAGE] Channel found:`, {
      exists: !!channel,
      name: channel?.name,
      type: channel?.type,
      totalDocs: channelResult.totalDocs,
    })

    if (!channel) {
      console.log(`[CHANNEL_PAGE] Channel not found, redirecting`)
      return redirect(`/spaces/${spaceId}`)
    }

    // Fetch all channels for the space
    const allChannelsResult = await payload.find({
      collection: 'channels',
      where: {
        space: { equals: spaceId },
      },
      depth: 1,
    })

    const channels = {
      text: allChannelsResult.docs.filter((ch) => ch.type === ChannelType.TEXT),
      audio: allChannelsResult.docs.filter((ch) => ch.type === ChannelType.AUDIO),
      video: allChannelsResult.docs.filter((ch) => ch.type === ChannelType.VIDEO),
    }

    // Fetch members with greater depth to populate user objects
    const membersResult = await payload.find({
      collection: 'members',
      where: {
        space: { equals: spaceId },
      },
      depth: 2, // Increase depth to populate user objects
    })

    const members = membersResult.docs as ExtendedMember[]
    console.log(`[CHANNEL_PAGE] Members found: ${members.length}`)

    // Add direct query to check membership
    const directMemberCheck = await payload.find({
      collection: 'members',
      where: {
        space: { equals: spaceId },
        user: { equals: user.id },
      },
      depth: 0,
    })

    console.log(`[CHANNEL_PAGE] Direct member check:`, {
      found: directMemberCheck.totalDocs > 0,
      totalFound: directMemberCheck.totalDocs,
      memberId: directMemberCheck.docs[0]?.id,
    })

    // Use the direct check if available
    const currentMember =
      directMemberCheck.totalDocs > 0
        ? directMemberCheck.docs[0]
        : members.find((member) => {
            // Log the member to debug
            console.log(`[CHANNEL_PAGE] Checking member:`, {
              memberUserId: typeof member.user === 'string' ? member.user : member.user?.id,
              currentUserId: user.id,
              isMatch:
                typeof member.user === 'string'
                  ? member.user === user.id
                  : member.user?.id === user.id,
            })

            // Handle both string IDs and populated user objects
            return typeof member.user === 'string'
              ? member.user === user.id
              : member.user?.id === user.id
          })

    console.log(`[CHANNEL_PAGE] Current member check:`, {
      isMember: !!currentMember,
      role: currentMember?.role,
    })

    if (!currentMember) {
      console.log(`[CHANNEL_PAGE] User is not a member of this space, redirecting`)
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666]">
          <div className="p-8 rounded-lg bg-black/20 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Join this Space</h1>
            <p className="text-zinc-200 mb-6">
              You need to join this space before you can access its channels.
            </p>
            <JoinSpaceButton spaceId={spaceId} userId={user.id} />
            <div className="mt-4">
              <Link href="/spaces" className="text-zinc-400 hover:text-zinc-200 text-sm">
                Back to Spaces
              </Link>
            </div>
          </div>
        </div>
      )
    }

    console.log(`[CHANNEL_PAGE] All checks passed, rendering channel page`)

    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <ChatHeader
          spaceId={spaceId}
          name={channel.name}
          type="channel"
          space={space}
          channels={channels}
          members={members}
          role={currentMember.role}
        />
        {channel.type === ChannelType.TEXT && (
          <div className="flex flex-col flex-1 min-h-0">
            <ChatMessages
              name={channel.name}
              member={currentMember}
              chatId={channelId}
              type="channel"
              apiUrl="/api/messages"
              socketUrl="/api/socket/messages"
              socketQuery={{
                channelId,
                spaceId,
              }}
              paramKey="channelId"
              paramValue={channelId}
              currentSpace={space}
              currentChannel={channel}
            />
            <ChatInput name={channel.name} type="channel" spaceId={spaceId} chatId={channelId} />
          </div>
        )}
        {channel.type === ChannelType.AUDIO && (
          <div className="flex-1 relative" style={{ height: 'calc(100vh - 56px)' }}>
            <MediaRoom chatId={channelId} video={false} audio={true} />
          </div>
        )}
        {channel.type === ChannelType.VIDEO && (
          <div className="flex-1 relative" style={{ height: 'calc(100vh - 56px)' }}>
            <MediaRoom chatId={channelId} video={true} audio={true} />
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error(`[CHANNEL_PAGE] Error:`, error)
    return redirect('/spaces')
  }
}

export default ChannelIdPage
