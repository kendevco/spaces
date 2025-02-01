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

  // Get the authenticated user using server-side auth
  const user = await getCurrentUser()
  if (!user?.id) {
    return redirect(
      `/login?redirect=${encodeURIComponent(`/spaces/${spaceId}/channels/${channelId}`)}`,
    )
  }

  const payload = await getPayloadClient()

  // Fetch space data
  const spaceResult = await payload.find({
    collection: 'spaces',
    where: { id: { equals: spaceId } },
    depth: 1,
  })

  const space = spaceResult.docs[0]
  if (!space) {
    return redirect('/spaces')
  }

  // Fetch channel data
  const channelResult = await payload.find({
    collection: 'channels',
    where: { id: { equals: channelId } },
    depth: 1,
  })

  const channel = channelResult.docs[0]
  if (!channel) {
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

  // Fetch members
  const membersResult = await payload.find({
    collection: 'members',
    where: {
      space: { equals: spaceId },
    },
    depth: 1,
  })

  const members = membersResult.docs as ExtendedMember[]

  // Find current member's role
  const currentMember = members.find(
    (member) => typeof member.user !== 'string' && member.user.id === user.id,
  )

  if (!currentMember) {
    return redirect('/spaces')
  }

  return (
    <div className="flex flex-col min-h-screen">
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
        <>
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
        </>
      )}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom chatId={channelId} video={false} audio={true} />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channelId} video={true} audio={true} />
      )}
    </div>
  )
}

export default ChannelIdPage
