import type { Channel, Space } from '@/payload-types'
import { getPayloadClient } from '../utilities/payload/getPayloadClient'
import { toast } from '@payloadcms/ui'

// Define channel types
type ChannelType = 'text' | 'audio' | 'video'

// Define required fields for channel creation
interface CreateChannelData {
  name: string
  space: string | Space  // Space reference is required
  description?: string | null
  type?: ChannelType  // Use correct channel types
}

// Define update fields
type UpdateChannelData = Partial<Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>>

export const channelService = {
  async findById(id: string, depth: number = 1): Promise<Channel | null> {
    try {
      const payload = await getPayloadClient()
      return await payload.findByID({
        collection: 'channels',
        id,
        depth
      })
    } catch (error) {
      console.error('[CHANNEL_SERVICE_FIND_BY_ID]', error)
      toast.error('Failed to find channel')
      return null
    }
  },

  async createChannel(data: CreateChannelData): Promise<Channel | null> {
    try {
      const payload = await getPayloadClient()

      const channel = await payload.create({
        collection: 'channels',
        data: {
          name: data.name,
          space: data.space,
          description: data.description || null,
          type: data.type || 'text'  // Default to text channel
        }
      })

      toast.success('Channel created successfully')
      return channel
    } catch (error) {
      console.error('[CHANNEL_SERVICE_CREATE]', error)
      toast.error('Failed to create channel')
      return null
    }
  },

  async updateChannel(id: string, data: UpdateChannelData): Promise<Channel | null> {
    try {
      const payload = await getPayloadClient()
      const channel = await payload.update({
        collection: 'channels',
        id,
        data
      })

      toast.success('Channel updated successfully')
      return channel
    } catch (error) {
      console.error('[CHANNEL_SERVICE_UPDATE]', error)
      toast.error('Failed to update channel')
      return null
    }
  },

  async deleteChannel(id: string): Promise<Channel | null> {
    try {
      const payload = await getPayloadClient()
      const channel = await payload.delete({
        collection: 'channels',
        id
      })

      toast.success('Channel deleted successfully')
      return channel
    } catch (error) {
      console.error('[CHANNEL_SERVICE_DELETE]', error)
      toast.error('Failed to delete channel')
      return null
    }
  }
}
