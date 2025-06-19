import { getPayloadClient } from '../payload/getPayloadClient'
import { MemberRoles } from '@/spaces/constants'

interface PresenceData {
  userId: string
  memberId: string
  isOnline: boolean
}

export async function updatePresence({ userId, memberId, isOnline: _isOnline }: PresenceData) {
  try {
    const payload = await getPayloadClient()

    // Update member's online status and last seen
    await payload.update({
      collection: 'members',
      id: memberId,
      data: {
        user: userId,
        role: MemberRoles.MEMBER,
      },
    })

    return true
  } catch (error) {
    console.error('[UPDATE_PRESENCE_ERROR]', error)
    return false
  }
}

export async function updateManyPresence(memberIds: string[], _isOnline: boolean) {
  try {
    const payload = await getPayloadClient()

    // Update multiple members' online status and last seen
    await payload.update({
      collection: 'members',
      where: {
        id: {
          in: memberIds,
        },
      },
      data: {
        role: MemberRoles.MEMBER,
        updatedAt: new Date().toISOString(), // Use updatedAt for last seen
      },
    })

    return true
  } catch (error) {
    console.error('[UPDATE_MANY_PRESENCE_ERROR]', error)
    return false
  }
}
