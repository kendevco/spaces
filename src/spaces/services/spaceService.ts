import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'
import { logError, logInfo } from '@/spaces/utilities/logging'
import type { Space, Channel } from '@/payload-types'

class SpaceService {
  private static getRandomSpaceImage(): string {
    const imageNumber = Math.floor(Math.random() * 8) + 1
    return `/images/seed/blog-${imageNumber}.jpg`
  }

  public static async findOrCreatePersonalSpace(userId: string): Promise<Space> {
    try {
      const payload = await getPayloadClient()
      const spaces = await payload.find({
        collection: 'spaces',
        where: {
          owner: {
            equals: userId,
          },
        },
        depth: 2,
      })

      if (spaces.docs.length > 0) {
        return spaces.docs[0] as Space
      }

      return await this.createSpace('Personal Space', userId)
    } catch (error) {
      logError('spaceService', error)
      throw error
    }
  }

  public static async ensureGlobalSettings(): Promise<void> {
    try {
      const payload = await getPayloadClient()
      const globals = await payload.findGlobal({
        slug: 'settings',
      })

      if (!globals) {
        await payload.updateGlobal({
          slug: 'settings',
          data: {
            menuItems: [],
          },
        })
        logInfo('spaceService', 'Global settings initialized')
      }
    } catch (error) {
      logError('spaceService', error)
      throw error
    }
  }

  public static async listUserSpaces(userId: string): Promise<Space[]> {
    try {
      const payload = await getPayloadClient()
      const spaces = await payload.find({
        collection: 'spaces',
        where: {
          owner: {
            equals: userId,
          },
        },
        depth: 2,
      })

      return spaces.docs as Space[]
    } catch (error) {
      logError('spaceService', error)
      throw error
    }
  }

  public static async createSpace(name: string, userId: string): Promise<Space> {
    try {
      const payload = await getPayloadClient()

      // First create the space with required fields
      const space = (await payload.create({
        collection: 'spaces',
        data: {
          name,
          owner: userId,
          image: this.getRandomSpaceImage(),
        },
      })) as Space

      // Then create the member with proper fields
      await payload.create({
        collection: 'members',
        data: {
          user: userId,
          email: `${userId}@space.member`,
          role: 'admin',
          space: space.id,
        },
      })

      // Create default general channel
      const channel = await payload.create({
        collection: 'channels',
        data: {
          name: 'general',
          type: 'text',
          space: space.id,
        },
      })

      // Update space with the channel
      await payload.update({
        collection: 'spaces',
        id: space.id,
        data: {
          channels: [channel.id],
        },
      })

      // Fetch the updated space with channels
      const updatedSpace = await payload.findByID({
        collection: 'spaces',
        id: space.id,
        depth: 2,
      })

      return updatedSpace as Space
    } catch (error) {
      logError('spaceService', error)
      throw error
    }
  }

  public static async createDefaultChannel(spaceId: string): Promise<Channel> {
    const payload = await getPayloadClient()

    const channel = await payload.create({
      collection: 'channels',
      data: {
        name: 'general',
        space: spaceId,
        type: 'text'
      }
    })

    return {
      ...channel,
      spaceId: spaceId
    } as Channel
  }

  async getSpaceWithChannels(spaceId: string) {
    const payload = await getPayloadClient()

    return await payload.findByID({
      collection: 'spaces',
      id: spaceId,
      depth: 2
    })
  }
}

export default SpaceService
