'use server'

import { Channel, Space } from '@/payload-types'
import { ChannelType } from '@/spaces/types'
import { getPayloadClient } from '../utilities/payload/getPayloadClient'
import { revalidatePath } from 'next/cache'

interface CreateChannelData {
  name: string
  type: ChannelType
  space: string
}

interface UpdateChannelData {
  name: string
  type: ChannelType
  space: string
}

export async function findChannelById(channelId: string): Promise<Channel | null> {
  try {
    const payload = await getPayloadClient()
    const channel = await payload.findByID({
      collection: 'channels',
      id: channelId,
    })
    return channel
  } catch (error) {
    console.error('Error finding channel:', error)
    return null
  }
}

export async function createChannel(data: CreateChannelData): Promise<Channel | null> {
  try {
    const payload = await getPayloadClient()
    const channel = await payload.create({
      collection: 'channels',
      data: {
        name: data.name,
        type: data.type,
        space: data.space,
      },
    })

    revalidatePath('/spaces/[spaceId]', 'layout')
    return channel
  } catch (error) {
    console.error('Error creating channel:', error)
    return null
  }
}

export async function updateChannel(
  channelId: string,
  data: UpdateChannelData,
): Promise<Channel | null> {
  try {
    const payload = await getPayloadClient()
    const channel = await payload.update({
      collection: 'channels',
      id: channelId,
      data: {
        name: data.name,
        type: data.type,
        space: data.space,
      },
    })

    revalidatePath('/spaces/[spaceId]', 'layout')
    return channel
  } catch (error) {
    console.error('Error updating channel:', error)
    return null
  }
}

export async function deleteChannel(channelId: string): Promise<boolean> {
  try {
    const payload = await getPayloadClient()
    await payload.delete({
      collection: 'channels',
      id: channelId,
    })

    revalidatePath('/spaces/[spaceId]', 'layout')
    return true
  } catch (error) {
    console.error('Error deleting channel:', error)
    return false
  }
}
