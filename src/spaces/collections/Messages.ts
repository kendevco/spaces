import type { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'

const Messages: CollectionConfig = {
  slug: 'messages',
  admin: {
    group: 'Spaces',
    useAsTitle: 'content',
    defaultColumns: ['content', 'member', 'channel', 'role'],
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'content',
      type: 'text',
      required: true,
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'spaces-media',
      hasMany: true,
    },
    {
      name: 'channel',
      type: 'relationship',
      relationTo: 'channels',
      required: true,
    },
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members',
      required: true,
      admin: {
        description: 'Select a member',
        position: 'sidebar',
      },
    },
    {
      name: 'sender',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'User', value: 'user' },
        { label: 'System', value: 'system' },
      ],
      defaultValue: 'user',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'deleted',
      type: 'text',
      defaultValue: 'false',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

export default Messages
