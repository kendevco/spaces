import type { CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'

const Conversations: CollectionConfig = {
  slug: 'conversations',
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
      name: 'memberOne',
      type: 'relationship',
      relationTo: 'members',
      required: true,
    },
    {
      name: 'memberTwo',
      type: 'relationship',
      relationTo: 'members',
      required: true,
    },
    {
      name: 'directMessages',
      type: 'relationship',
      relationTo: 'direct-messages',
      hasMany: true,
    },
  ],
}

export default Conversations
