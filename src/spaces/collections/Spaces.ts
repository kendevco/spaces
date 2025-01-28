import { CollectionConfig, Where } from 'payload'
import { authenticated } from '../../access/authenticated'
import { User } from '@/payload-types'

const Spaces: CollectionConfig = {
  slug: 'spaces',
  admin: {
    group: 'Spaces',
    useAsTitle: 'name',
    defaultColumns: ['name', 'owner', 'members'],
  },
  access: {
    create: async ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
    read: ({ req: { user } }): Where | boolean => {
      if (!user) return false

      // Admin and moderators can read all spaces
      if (user.role === 'admin' || user.role === 'moderator') return true

      // For all other cases, only return spaces where user is owner or member
      return {
        or: [
          {
            'owner.value': {
              equals: user.id,
            },
          },
          {
            'members.value': {
              equals: user.id,
            },
          },
        ] as Where[],
      }
    },
    update: async ({ req: { user, payload }, id }) => {
      if (!user || !id) return false

      // Admin can update any space
      if (user.role === 'admin') return true

      try {
        const space = await payload.findByID({
          collection: 'spaces',
          id,
          depth: 0,
        })

        // Owner can update their space
        const ownerId = typeof space.owner === 'string' ? space.owner : space.owner?.id
        if (ownerId === user.id) return true

        // Check if user is an admin member of the space
        const members = await payload.find({
          collection: 'members',
          where: {
            and: [
              {
                space: {
                  equals: id,
                },
              },
              {
                user: {
                  equals: user.id,
                },
              },
              {
                role: {
                  equals: 'admin',
                },
              },
            ],
          },
        })

        return members.totalDocs > 0
      } catch (error) {
        return false
      }
    },
    delete: async ({ req: { user, payload }, id }) => {
      if (!user || !id) return false

      // Admin can delete any space
      if (user.role === 'admin') return true

      try {
        const space = await payload.findByID({
          collection: 'spaces',
          id,
          depth: 0,
        })

        // Only owner can delete their space
        const ownerId = typeof space.owner === 'string' ? space.owner : space.owner?.id
        return ownerId === user.id
      } catch (error) {
        return false
      }
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Space owner',
        position: 'sidebar',
      },
      access: {
        update: ({ req: { user } }) => user?.role === 'admin', // Only admin can change owner
      },
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'spaces-media',
      admin: {
        description: 'Space image',
        position: 'sidebar',
      },
      filterOptions: {
        category: {
          equals: 'space',
        },
      },
    },
    {
      name: 'channels',
      type: 'relationship',
      relationTo: 'channels',
      hasMany: true,
      admin: {
        description: 'Space channels',
      },
    },
    {
      name: 'members',
      type: 'relationship',
      relationTo: 'members',
      hasMany: true,
      admin: {
        description: 'Space members',
        position: 'sidebar',
      },
    },
    {
      name: 'inviteCode',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            // Generate invite code if not present
            if (!data?.inviteCode) {
              return crypto.randomUUID()
            }
            return data.inviteCode
          },
        ],
      },
    },
  ],
}

export default Spaces
