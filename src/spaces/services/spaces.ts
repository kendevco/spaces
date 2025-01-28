import type { Space } from '@/payload-types'
import type { PayloadRequest, RequestContext } from 'payload'
import { getPayloadClient } from '../utilities/payload/getPayloadClient'

// Define PaginatedDocs type locally
interface PaginatedDocs<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

// Define required fields for space creation
type CreateSpaceData = {
  name: string
  imageUrl?: string | null
  owner: string
}

// Define update fields
type UpdateSpaceData = Partial<Omit<Space, 'id' | 'createdAt' | 'updatedAt'>>

// Define query params
interface FindManyParams {
  query?: Record<string, any>
  page?: number
  limit?: number
  depth?: number
  sort?: string
}

export const spaceService = {
  async create(data: CreateSpaceData): Promise<Space> {
    try {
      const payload = await getPayloadClient()

      return await payload.create({
        collection: 'spaces',
        data: {
          name: data.name,
          image: data.imageUrl || null,
          owner: data.owner,
          members: [],
          channels: [],
        },
      })
    } catch (error) {
      console.error('[SPACE_SERVICE_CREATE]', error)
      throw new Error('Failed to create space')
    }
  },

  async findById(id: string, depth: number = 1): Promise<Space | null> {
    try {
      const payload = await getPayloadClient()
      return await payload.findByID({
        collection: 'spaces',
        id,
        depth,
      })
    } catch (error) {
      console.error('[SPACE_SERVICE_FIND_BY_ID]', error)
      return null
    }
  },

  async findMany({
    query = {},
    page = 1,
    limit = 10,
    depth = 1,
    sort = '-createdAt',
  }: FindManyParams = {}): Promise<PaginatedDocs<Space>> {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'spaces',
        where: query,
        depth,
        page,
        limit,
        sort,
      })

      // Transform to match our PaginatedDocs interface
      return {
        docs: result.docs,
        totalDocs: result.totalDocs,
        limit: result.limit || limit,
        totalPages: result.totalPages,
        page: result.page || page,
        pagingCounter: (result.page || page) * (result.limit || limit),
        hasPrevPage: result.hasPrevPage || false,
        hasNextPage: result.hasNextPage || false,
        prevPage: result.prevPage ?? null,
        nextPage: result.nextPage ?? null,
      }
    } catch (error) {
      console.error('[SPACE_SERVICE_FIND_MANY]', error)
      return {
        docs: [],
        totalDocs: 0,
        limit,
        totalPages: 1,
        page,
        pagingCounter: page * limit,
        hasNextPage: false,
        hasPrevPage: false,
        prevPage: null,
        nextPage: null,
      }
    }
  },

  async update(id: string, data: UpdateSpaceData): Promise<Space> {
    try {
      const payload = await getPayloadClient()
      return await payload.update({
        collection: 'spaces',
        id,
        data,
      })
    } catch (error) {
      console.error('[SPACE_SERVICE_UPDATE]', error)
      throw new Error('Failed to update space')
    }
  },

  async delete(id: string): Promise<Space> {
    try {
      const payload = await getPayloadClient()
      return await payload.delete({
        collection: 'spaces',
        id,
      })
    } catch (error) {
      console.error('[SPACE_SERVICE_DELETE]', error)
      throw new Error('Failed to delete space')
    }
  },
}
