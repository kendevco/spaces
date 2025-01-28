// src/app/(spaces)/spaces/[spaceId]/page.tsx

import { redirect } from 'next/navigation'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { getAuthenticatedUser } from '@/app/(frontend)/(spaces)/spaces/actions'
import type { Channel } from '@/payload-types'

interface PageProps {
  params: Promise<{ spaceId: string }>
}

export default async function SpacePage({ params }: PageProps) {
  try {
    const { spaceId } = await params
    const { user } = await getAuthenticatedUser()

    if (!user) {
      return redirect('/login')
    }

    const payload = await getPayloadClient()
    const {
      docs: [space],
    } = await payload.find({
      collection: 'spaces',
      where: {
        id: {
          equals: spaceId,
        },
        or: [
          {
            owner: {
              equals: user.id,
            },
          },
          {
            'members.user': {
              equals: user.id,
            },
          },
        ],
      },
      depth: 2,
      user,
    })

    if (!space) {
      console.error('[SPACE_PAGE] Space not found:', spaceId)
      return redirect('/spaces')
    }

    // Find or create the general channel
    const generalChannel = space.channels?.find(
      (channel: any) => typeof channel !== 'string' && channel.name === 'general',
    ) as Channel | undefined

    if (!generalChannel) {
      try {
        // Create general channel
        const newChannel = await payload.create({
          collection: 'channels',
          data: {
            name: 'general',
            space: space.id,
            type: 'text',
            description: 'General discussion channel',
          },
          user,
        })

        return redirect(`/spaces/${spaceId}/channels/${newChannel.id}`)
      } catch (error) {
        console.error('[SPACE_PAGE] Error creating general channel:', error)
        return redirect('/spaces')
      }
    }

    return redirect(`/spaces/${spaceId}/channels/${generalChannel.id}`)
  } catch (error) {
    // Don't treat redirect "errors" as actual errors
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error // Let Next.js handle the redirect
    }

    console.error('[SPACE_PAGE] Error:', error)
    return redirect('/spaces')
  }
}
