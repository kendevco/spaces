import type { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'

const DirectMessages: CollectionConfig = {
  slug: 'direct-messages',
  admin: {
    group: 'Spaces',
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
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'conversation',
      type: 'relationship',
      relationTo: 'conversations',
      required: true,
    },
    {
      name: 'sender',
      type: 'relationship',
      relationTo: 'users',
      required: true,
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
    },
    {
      name: 'deleted',
      type: 'text',
      defaultValue: 'false',
    }
  ],
}

export default DirectMessages
