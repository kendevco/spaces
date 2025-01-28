import { Member } from '@/payload-types'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'

type PayloadMemberRole = 'admin' | 'member'

type CreateMemberData = {
  user: string
  space: string
  role: PayloadMemberRole
  email: string
}

export const memberService = {
  async create(data: CreateMemberData) {
    try {
      const payload = await getPayloadClient()
      return await payload.create({
        collection: 'members',
        data: {
          user: data.user,
          space: data.space,
          role: data.role,
          email: data.email,
        },
      })
    } catch (error) {
      console.error('[MEMBER_SERVICE_CREATE]', error)
      throw new Error('Failed to create member')
    }
  },
}
