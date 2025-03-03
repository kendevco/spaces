'use server'

import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { revalidatePath } from 'next/cache'
import { CollectionSlugs, MemberRole } from '@/spaces/types'
import { cookies } from 'next/headers'
import { spaceService } from '@/spaces/services/spaces'

export async function getSpaces() {
  try {
    const payload = await getPayloadClient()
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      console.log('[SPACES_ACTION] No token found')
      return { success: false, error: 'Not authenticated' }
    }

    const { user } = await payload.auth({
      headers: new Headers({
        Authorization: `JWT ${token}`,
      }),
    })

    if (!user) {
      console.log('[SPACES_ACTION] No user found')
      return { success: false, error: 'Not authenticated' }
    }

    const spaces = await payload.find({
      collection: CollectionSlugs.SPACES,
      depth: 2,
      where: {
        OR: [{ owner: { equals: user.id } }, { 'members.user': { equals: user.id } }],
      },
    })

    console.log('[SPACES_ACTION] Found spaces:', {
      count: spaces.docs.length,
      userId: user.id,
    })

    return { success: true, data: spaces.docs }
  } catch (error) {
    console.error('[SPACES_ACTION] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch spaces',
      details: error,
    }
  }
}

export async function updateSpace(spaceId: string, data: { name: string; image: string }) {
  try {
    const payload = await getPayloadClient()

    await payload.update({
      collection: CollectionSlugs.SPACES,
      id: spaceId,
      data: {
        name: data.name,
        image: data.image,
      },
    })

    revalidatePath('/spaces')
    return { success: true }
  } catch (error) {
    console.error('Error updating space:', error)
    return { success: false, error: 'Failed to update space' }
  }
}

export async function createSpace({ name, imageUrl }: { name: string; imageUrl: string }) {
  try {
    const payload = await getPayloadClient()
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const { user } = await payload.auth({
      headers: new Headers({
        Authorization: `JWT ${token}`,
      }),
    })

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const space = await spaceService.create({
      name,
      imageUrl,
      owner: user.id,
    })

    revalidatePath('/spaces')
    return { success: true, data: space }
  } catch (error) {
    console.error('[CREATE_SPACE_ACTION]', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create space',
    }
  }
}

export async function deleteSpace(spaceId: string) {
  try {
    const payload = await getPayloadClient()

    await payload.delete({
      collection: CollectionSlugs.SPACES,
      id: spaceId,
    })

    revalidatePath('/spaces')
    return { success: true }
  } catch (error) {
    console.error('Error deleting space:', error)
    return { success: false, error: 'Failed to delete space' }
  }
}

export async function getSpaceData(spaceId: string) {
  try {
    const payload = await getPayloadClient()
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return { success: false, error: 'Not authenticated' }
    }

    const { user } = await payload.auth({
      headers: new Headers({
        Authorization: `JWT ${token}`,
      }),
    })

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get space data
    const space = await payload.findByID({
      collection: CollectionSlugs.SPACES,
      id: spaceId,
      depth: 2,
    })

    if (!space) {
      return { success: false, error: 'Space not found' }
    }

    // Get members and channels data
    const [members, channels, directMemberCheck] = await Promise.all([
      payload.find({
        collection: CollectionSlugs.MEMBERS,
        where: {
          space: {
            equals: spaceId,
          },
        },
        depth: 2,
      }),

      payload.find({
        collection: CollectionSlugs.CHANNELS,
        where: {
          space: {
            equals: spaceId,
          },
        },
        depth: 1,
      }),

      // Direct member check (more reliable)
      payload.find({
        collection: CollectionSlugs.MEMBERS,
        where: {
          space: { equals: spaceId },
          user: { equals: user.id },
        },
        depth: 1,
      })
    ]);

    console.log('[GET_SPACE_DATA] Direct member check result:', {
      found: directMemberCheck.totalDocs > 0,
      memberId: directMemberCheck.docs[0]?.id,
      role: directMemberCheck.docs[0]?.role,
    });

    // If user is a member but not found in the members list, add them
    if (directMemberCheck.totalDocs > 0) {
      const directMember = directMemberCheck.docs[0];

      // Check if the member is already in the list
      const memberExists = members.docs.some(member =>
        (typeof member.user === 'string' && member.user === user.id) ||
        (typeof member.user !== 'string' && member.user?.id === user.id)
      );

      // If not in the list, add them
      if (!memberExists && directMember) {
        console.log('[GET_SPACE_DATA] Adding current user to members list');
        members.docs.push(directMember);
      }
    }

    return {
      success: true,
      space,
      members: members.docs,
      channels: channels.docs,
    }
  } catch (error) {
    console.error('[GET_SPACE_DATA]', error)
    return { success: false, error: 'Failed to fetch space data' }
  }
}

export async function getSpaceById(spaceId: string) {
  try {
    const payload = await getPayloadClient()
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      throw new Error('Not authenticated')
    }

    const { user } = await payload.auth({
      headers: new Headers({
        Authorization: `JWT ${token}`,
      }),
    })

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Check if user has access to this space
    const space = await payload.find({
      collection: CollectionSlugs.SPACES,
      depth: 2,
      where: {
        AND: [
          { id: { equals: spaceId } },
          {
            OR: [
              { owner: { equals: user.id } },
              {
                AND: [
                  { 'members.role': { equals: MemberRole.MEMBER } },
                  { 'members.user.id': { equals: user.id } },
                ],
              },
              {
                AND: [
                  { 'members.role': { equals: MemberRole.MODERATOR } },
                  { 'members.user.id': { equals: user.id } },
                ],
              },
            ],
          },
        ],
      },
    })

    if (!space.docs?.[0]) {
      throw new Error('Space not found or access denied')
    }

    return { success: true, data: space.docs[0] }
  } catch (error) {
    console.error('[SPACE_ACTION] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch space',
    }
  }
}
