'use server'

import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { revalidatePath } from 'next/cache'
import { CollectionSlugs, MemberRole } from '@/spaces/types'
import { Member } from '@/payload-types'

interface AddMemberParams {
  spaceId: string
  userId: string
  role: MemberRole
}

export async function addMember({ spaceId, userId, role }: AddMemberParams) {
  try {
    const payload = await getPayloadClient()

    // First check if user exists
    const user = await payload.findByID({
      collection: CollectionSlugs.USERS,
      id: userId,
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Check if member already exists
    const existingMember = await payload.find({
      collection: CollectionSlugs.MEMBERS,
      where: {
        user: {
          equals: userId,
        },
        space: {
          equals: spaceId,
        },
      },
    })

    if (existingMember.docs.length > 0) {
      return { success: false, error: 'Member already exists' }
    }

    // Create member
    await payload.create({
      collection: CollectionSlugs.MEMBERS,
      data: {
        user: userId,
        space: spaceId,
        role: role as Member['role'],
        email: user.email,
      },
    })

    revalidatePath('/spaces')
    return { success: true }
  } catch (error) {
    console.error('Error adding member:', error)
    return { success: false, error: 'Failed to add member' }
  }
}

export async function updateMemberRole({ memberId, role }: { memberId: string; role: MemberRole }) {
  try {
    const payload = await getPayloadClient()

    await payload.update({
      collection: CollectionSlugs.MEMBERS,
      id: memberId,
      data: {
        role: role as Member['role'],
      },
    })

    revalidatePath('/spaces')
    return { success: true }
  } catch (error) {
    console.error('Error updating member role:', error)
    return { success: false, error: 'Failed to update member role' }
  }
}

export async function removeMember(memberId: string) {
  try {
    const payload = await getPayloadClient()

    await payload.delete({
      collection: CollectionSlugs.MEMBERS,
      id: memberId,
    })

    revalidatePath('/spaces')
    return { success: true }
  } catch (error) {
    console.error('Error removing member:', error)
    return { success: false, error: 'Failed to remove member' }
  }
}

export async function searchMembers(query: string, spaceId: string) {
  try {
    const payload = await getPayloadClient()

    const { docs } = await payload.find({
      collection: CollectionSlugs.USERS,
      where: {
        email: {
          contains: query,
        },
      },
      limit: 5,
    })

    return docs.map((user) => ({
      id: user.id,
      name: user.name || '',
      email: user.email,
      imageUrl: null,
    }))
  } catch (error) {
    console.error('Error searching members:', error)
    return []
  }
}
