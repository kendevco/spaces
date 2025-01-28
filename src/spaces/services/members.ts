import { getPayloadClient } from '../utilities/payload/getPayloadClient'
import type { Member } from '@/payload-types'

export const memberService = {
  async getMember(id: string) {
    const payload = await getPayloadClient()
    return payload.findByID({
      collection: 'members',
      id,
      depth: 2,
    })
  },

  async getMembers(spaceId: string) {
    const payload = await getPayloadClient()
    return payload.find({
      collection: 'members',
      where: {
        space: {
          equals: spaceId,
        },
      },
      depth: 2,
    })
  },
}
