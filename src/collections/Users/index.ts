import type { CollectionConfig } from 'payload'
import { CollectionSlugs } from '@/spaces/types'
import { MemberRole } from '@/spaces/types'
import { addToHomeSpace } from './hooks/addToHomeSpace'

export type UserRole = 'admin' | 'moderator' | 'user'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: true,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // lock time in ms (10 minutes)
    depth: 2, // Ensure relationships are populated
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: 'user',
      required: true,
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Moderator',
          value: 'moderator',
        },
        {
          label: 'User',
          value: 'user',
        },
      ],
      access: {
        read: ({ req: { user } }) => Boolean(user),
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      access: {
        read: ({ req: { user }, doc }) => {
          if (!user) return false
          if (user.role === 'admin' || user.role === 'moderator') return true
          return Boolean(user.id) && user.id === doc.id
        },
      },
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
      access: {
        read: () => true,
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      access: {
        read: () => true,
      },
    },
    {
      name: 'name',
      type: 'text',
      admin: {
        components: {
          Field: undefined,
        },
      },
      hooks: {
        beforeChange: [
          ({ data, originalDoc }) => {
            const first = data?.firstName || originalDoc?.firstName || ''
            const last = data?.lastName || originalDoc?.lastName || ''
            return `${first} ${last}`.trim()
          },
        ],
      },
      access: {
        read: () => true,
      },
    },
    {
      name: 'spaces',
      type: 'relationship',
      relationTo: 'spaces',
      hasMany: true,
      admin: {
        description: 'Spaces this user belongs to',
      },
      access: {
        read: ({ req: { user }, doc }) => {
          if (!user) return false
          if (user.role === 'admin' || user.role === 'moderator') return true
          return Boolean(user.id) && user.id === doc.id
        },
      },
    },
    {
      name: 'aiPreferences',
      type: 'json',
      admin: {
        description: 'AI-related preferences and settings',
      },
    },
    {
      name: 'apiKey',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'API key for programmatic access',
      },
      access: {
        read: ({ req: { user }, doc }) => {
          if (!user) return false
          if (user.role === 'admin') return true
          return Boolean(user.id) && user.id === doc.id
        },
        update: ({ req: { user }, doc }) => {
          if (!user) return false
          if (user.role === 'admin') return true
          return Boolean(user.id) && user.id === doc.id
        },
      },
    },
    {
      name: 'imageUrl',
      type: 'text',
      admin: {
        description: 'URL to user profile image',
      },
    },
    {
      name: 'loginAttempts',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'moderator') return true
      return Boolean(user.id)
    },
    create: () => false,
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if (user.role === 'admin' || user.role === 'moderator') return true
      return (
        Boolean(user.id) && {
          id: {
            equals: user.id,
          },
        }
      )
    },
    delete: ({ req: { user } }) => Boolean(user?.role === 'admin'),
  },
  timestamps: true,
  hooks: {
    afterChange: [addToHomeSpace],
  },
}
