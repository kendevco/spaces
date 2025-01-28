import { Channel } from '@/payload-types'
import { getPayloadClient } from '../utilities/payload/getPayloadClient'

export const ChannelService = {
  async findBySpaceId(spaceId: string): Promise<Channel[]> {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'channels',
      where: {
        space: {
          equals: spaceId
        }
      }
    })
    return docs
  }
}
