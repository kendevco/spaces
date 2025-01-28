import type { Message } from '@/payload-types'
import { getPayloadClient } from '../utilities/payload/getPayloadClient'
import { toast } from 'sonner'

export const messageService = {
  async deleteMessage(id: string): Promise<Message | null> {
    try {
      const payload = await getPayloadClient()
      const message = await payload.delete({
        collection: 'messages',
        id,
      })

      toast.success('Message deleted successfully')
      return message
    } catch (error) {
      console.error('[MESSAGE_SERVICE_DELETE]', error)
      toast.error('Failed to delete message')
      return null
    }
  },
}
