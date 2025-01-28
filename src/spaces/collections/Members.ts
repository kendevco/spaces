import { CollectionConfig } from 'payload'
import { MemberRole } from '../types'

const Members: CollectionConfig = {
  slug: 'members',
  admin: {
    group: 'Spaces',
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'user', 'space'],
    listSearchableFields: ['email', 'user.email'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      hasMany: false,
      admin: {
        description: 'Select a user for this member',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'Member email address',
        position: 'sidebar',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Admin', value: MemberRole.ADMIN },
        { label: 'Moderator', value: MemberRole.MODERATOR },
        { label: 'Guest', value: MemberRole.GUEST },
        { label: 'Member', value: MemberRole.MEMBER },
      ],
      defaultValue: MemberRole.MEMBER,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: 'spaces',
      required: true,
      admin: {
        description: 'The space this member belongs to',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data?.user) return data

        // Handle the case where user is already an object with an id
        if (typeof data.user === 'object' && data.user !== null && 'id' in data.user) {
          const userId = data.user.id
          try {
            const user = await req.payload.findByID({
              collection: 'users',
              id: userId,
              depth: 0,
            })
            if (user?.email) {
              return {
                ...data,
                email: user.email,
              }
            }
          } catch (error) {
            console.error('Error fetching user in Members beforeChange hook:', error)
          }
          return data
        }

        // Handle the case where user is a string ID
        if (typeof data.user === 'string') {
          try {
            const user = await req.payload.findByID({
              collection: 'users',
              id: data.user,
              depth: 0,
            })
            if (user?.email) {
              return {
                ...data,
                email: user.email,
              }
            }
          } catch (error) {
            console.error('Error fetching user in Members beforeChange hook:', error)
          }
        }

        return data
      },
    ],
    afterRead: [
      async ({ doc, req }) => {
        // Populate user data if it's not already populated
        if (doc.user && typeof doc.user === 'string') {
          try {
            const user = await req.payload.findByID({
              collection: 'users',
              id: doc.user,
              depth: 0,
            })
            return {
              ...doc,
              user,
            }
          } catch (error) {
            console.error('Error populating user in Members afterRead hook:', error)
          }
        }
        return doc
      },
    ],
  },
  timestamps: true,
}

export default Members
