import { CollectionConfig } from 'payload'
import { syncProfile } from './hooks/syncProfile'

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'profile',
      type: 'relationship',
      relationTo: 'profiles',
      hasMany: false,
    },
  ],
  hooks: {
    afterLogin: [syncProfile],
  },
}

export default Users
