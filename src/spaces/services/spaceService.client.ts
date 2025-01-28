import { Space } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'
import { ExtendedChannel, ExtendedMember } from '../types'

export const spaceService = {
  async getUserSpaces(): Promise<Space[]> {
    try {
      const response = await fetch(
        `${getClientSideURL()}/api/spaces?depth=2&populate[image][select][]=url`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          next: { revalidate: 0 },
        },
      )

      if (!response.ok) {
        console.error('[SPACE_SERVICE] Failed to fetch spaces:', response.status)
        return []
      }

      const data = await response.json()
      return data.docs || []
    } catch (error) {
      console.error('[SPACE_SERVICE] Error fetching spaces:', error)
      return []
    }
  },

  async createSpace(data: { name: string; imageUrl: string }): Promise<Space> {
    const response = await fetch(`${getClientSideURL()}/api/spaces`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create space')
    }

    return response.json()
  },

  async getSpaceData(spaceId: string) {
    try {
      // Fetch space data with channels and members in a single request
      const response = await fetch(`${getClientSideURL()}/api/spaces/${spaceId}?depth=2`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        next: { revalidate: 0 },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch space data')
      }

      const space = await response.json()

      return {
        space,
        channels: space.channels || [],
        members: space.members || [],
      }
    } catch (error) {
      console.error('[SPACE_SERVICE]', error)
      throw error
    }
  },
}
