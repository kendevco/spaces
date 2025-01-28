import { Space } from '@/payload-types'
import { getPayloadClient } from '../utilities/payload/getPayloadClient'
import { toast } from 'sonner'

export const inviteService = {
  async generateNewInviteCode(spaceId: string): Promise<Space | null> {
    try {
      const payload = await getPayloadClient()
      const space = await payload.update({
        collection: 'spaces',
        id: spaceId,
        data: {
          inviteCode: crypto.randomUUID(),
        },
      })

      toast.success('New invite link generated')
      return space
    } catch (error) {
      console.error('[INVITE_SERVICE_GENERATE]', error)
      toast.error('Failed to generate new invite link')
      return null
    }
  },
}
