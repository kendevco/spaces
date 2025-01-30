import { getSpaceById, getSpaces, getSpaceData, createSpace } from '../actions/spaces'
import type { Space, Channel, Member } from '@/payload-types'

class SpaceService {
  async getUserSpaces(): Promise<Space[]> {
    const result = await getSpaces()
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data ?? []
  }

  async getSpaceById(spaceId: string): Promise<Space> {
    const result = await getSpaceById(spaceId)
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Space not found')
    }
    return result.data
  }

  async getSpaceData(spaceId: string): Promise<{
    space: Space
    members: Member[]
    channels: Channel[]
  }> {
    const result = await getSpaceData(spaceId)
    if (!result.success || !result.space) {
      throw new Error(result.error || 'Failed to fetch space data')
    }
    return {
      space: result.space,
      members: result.members ?? [],
      channels: result.channels ?? [],
    }
  }

  async createSpace(data: { name: string; imageUrl: string }): Promise<Space> {
    const result = await createSpace({
      name: data.name,
      imageUrl: data.imageUrl,
    })
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create space')
    }
    return result.data
  }
}

export const spaceService = new SpaceService()
