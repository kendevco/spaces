import type { Space as PayloadSpace } from '@/payload-types'
import { TransformedSpace } from '@/spaces/types/index'

export const transformPayloadSpace = (payloadSpace: PayloadSpace): TransformedSpace => ({
  id: payloadSpace.id,
  name: payloadSpace.name,
  owner: payloadSpace.owner,
  createdBy: payloadSpace.owner,
  members: payloadSpace.members || undefined,
  channels: payloadSpace.channels || undefined,
  createdAt: payloadSpace.createdAt,
  updatedAt: payloadSpace.updatedAt,
})
