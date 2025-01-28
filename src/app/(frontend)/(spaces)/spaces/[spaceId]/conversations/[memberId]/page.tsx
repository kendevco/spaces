// path: src/app/(spaces)/spaces/[spaceId]/conversations/[memberId]/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getMeUser } from '@/utilities/getMeUser'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { ChatHeader } from '@/spaces/components/chat/chat-header'
import { ChatMessages } from '@/spaces/components/chat/chat-messages'
import { ChatInput } from '@/spaces/components/chat/chat-input'
import { MediaRoom } from '@/spaces/components/media-room'
import type { Member as PayloadMember, User, Conversation } from '@/payload-types'
import type { ExtendedMember } from '@/spaces/types'

type Params = Promise<{ memberId: string; spaceId: string }>

interface MemberIdPageProps {
  params: Params
  searchParams: Promise<{ video?: boolean }>
}

export async function generateMetadata({ params }: MemberIdPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const { memberId, spaceId } = resolvedParams

  const payload = await getPayloadClient()
  const memberResult = await payload.findByID({
    collection: 'members',
    id: memberId,
    depth: 2,
  })

  const memberName =
    memberResult?.user && typeof memberResult.user === 'object'
      ? memberResult.user.name
      : 'Unknown User'
  return {
    title: `@${memberName}`,
    description: 'Direct message conversation',
  }
}

const MemberIdPage = async ({ params, searchParams }: MemberIdPageProps) => {
  const { spaceId, memberId } = await params
  const { video } = await searchParams

  // Get the authenticated user using server-side auth
  const { user } = await getMeUser({
    nullUserRedirect: '/login',
  })

  if (!user?.id) {
    return redirect(
      `/login?redirect=${encodeURIComponent(`/spaces/${spaceId}/conversations/${memberId}`)}`,
    )
  }

  const payload = await getPayloadClient()

  try {
    // Find the current member in the space
    const currentMember = (await payload.find({
      collection: 'members',
      where: {
        space: { equals: spaceId },
        user: { equals: user?.id },
      },
      depth: 2,
    })) as unknown as { docs: (PayloadMember & { profile: { imageUrl?: string } })[] }

    if (!currentMember.docs.length) {
      return redirect('/spaces')
    }

    const currentMemberDoc = currentMember.docs[0] as PayloadMember & {
      profile: { imageUrl?: string }
    }

    // Get or create conversation
    const conversation = await payload.find({
      collection: 'conversations',
      where: {
        or: [
          {
            and: [
              { memberOne: { equals: currentMemberDoc.id } },
              { memberTwo: { equals: memberId } },
            ],
          },
          {
            and: [
              { memberOne: { equals: memberId } },
              { memberTwo: { equals: currentMemberDoc.id } },
            ],
          },
        ],
      },
      depth: 2,
    })

    let conversationDoc = conversation.docs[0]

    if (!conversationDoc) {
      // Create new conversation with proper relationship structure
      conversationDoc = (await payload.create({
        collection: 'conversations',
        data: {
          memberOne: currentMemberDoc.id,
          memberTwo: memberId,
          directMessages: [],
          participants: [currentMemberDoc.id, memberId],
        } as unknown as Omit<Conversation, 'id' | 'sizes' | 'updatedAt' | 'createdAt'>,
      })) as Conversation
    }

    if (!conversationDoc) {
      return redirect(`/spaces/${spaceId}`)
    }

    // Get the other member with proper type assertion
    const otherMember = (await payload.findByID({
      collection: 'members',
      id: memberId,
      depth: 2,
    })) as unknown as {
      user: User
      profile: { imageUrl?: string }
    }

    // Ensure we have required fields with fallbacks
    const memberName = otherMember?.user?.name || 'Unknown User'
    const memberImage = otherMember?.profile?.imageUrl || ''

    return (
      <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
        <ChatHeader
          imageUrl={memberImage}
          name={memberName}
          spaceId={spaceId}
          type="conversation"
        />
        {video ? (
          <div className="flex-1 overflow-y-auto flex-grow h-0">
            <MediaRoom chatId={conversationDoc.id} video={true} audio={true} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto flex-grow h-0">
              <ChatMessages
                member={currentMember.docs[0] as ExtendedMember}
                name={memberName}
                chatId={conversationDoc.id}
                type="conversation"
                apiUrl="/api/direct-messages"
                paramKey="conversationId"
                paramValue={conversationDoc.id}
                socketUrl="/api/socket/direct-messages"
                socketQuery={{
                  conversationId: conversationDoc.id,
                  spaceId: spaceId,
                }}
              />
            </div>
            <ChatInput
              name={memberName}
              type="conversation"
              spaceId={spaceId}
              chatId={conversationDoc.id}
            />
          </>
        )}
      </div>
    )
  } catch (error) {
    console.error('[MEMBER_PAGE] Error in member page:', error)
    return redirect('/spaces')
  }
}

export default MemberIdPage
