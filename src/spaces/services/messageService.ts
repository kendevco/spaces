import { Message } from '@/payload-types'
import { getPayloadClient } from '../utilities/payload/getPayloadClient'

export const MessageService = {
  async findByChannelId(channelId: string): Promise<Message[]> {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'messages',
      where: {
        channel: {
          equals: channelId
        }
      }
    })
    return docs
  }
}
