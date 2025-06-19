'use server'

import { getPayloadClient } from '../utilities/payload/getPayloadClient'
import { ChannelType } from '../types'

export async function getSpaceData(spaceId: string) {
  const payload = await getPayloadClient()

  const [space, channels, members] = await Promise.all([
    payload.find({
      collection: 'spaces',
      where: { id: { equals: spaceId } },
      depth: 2,
    }),
    payload.find({
      collection: 'channels',
      where: {
        space: { equals: spaceId },
      },
      depth: 1,
    }),
    payload.find({
      collection: 'members',
      where: {
        space: { equals: spaceId },
      },
      depth: 2,
    }),
  ])

  return {
    space: space.docs[0],
    channels: channels.docs,
    members: members.docs,
  }
}
