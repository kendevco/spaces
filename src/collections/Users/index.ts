import type { CollectionConfig } from 'payload'
import { MemberRole } from '@/spaces/types'
import { addToHomeSpace } from './hooks/addToHomeSpace'
import { syncProfile, syncProfileOnLogin } from './hooks/syncProfile'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // lock time in ms (10 minutes)
    depth: 2,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'authorized'],
    group: 'Admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      defaultValue: MemberRole.MEMBER,
      required: true,
      options: [
        { label: 'Admin', value: MemberRole.ADMIN },
        { label: 'Moderator', value: MemberRole.MODERATOR },
        { label: 'Member', value: MemberRole.MEMBER },
        { label: 'Guest', value: MemberRole.GUEST },
      ],
      admin: {
        position: 'sidebar',
        description: 'User system role - controls system-wide permissions',
      },
    },
    {
      name: 'authorized',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Is this user authorized to access the system?',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'User email address - must be unique',
      },
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      admin: {
        components: {
          Field: undefined, // Hide from form, computed from firstName + lastName
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
    },
    {
      name: 'spaces',
      type: 'relationship',
      relationTo: 'spaces',
      hasMany: true,
      admin: {
        description: 'Spaces this user belongs to',
        position: 'sidebar',
      },
    },
    {
      name: 'loginAttempts',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Number of failed login attempts',
      },
    },
  ],
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      return (
        req.user.role === MemberRole.ADMIN ||
        req.user.role === MemberRole.MODERATOR ||
        req.user.id === req.user.id
      )
    },
    create: () => false, // Only through auth endpoints
    update: ({ req }) =>
      Boolean(req.user?.role === MemberRole.ADMIN || req.user?.role === MemberRole.MODERATOR),
    delete: ({ req: { user } }) => Boolean(user?.role === MemberRole.ADMIN && user.authorized),
  },
  timestamps: true,
  hooks: {
    afterChange: [addToHomeSpace, syncProfile],
    afterLogin: [syncProfileOnLogin],
  },
}
