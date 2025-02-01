import { CollectionConfig } from 'payload'
import { syncProfileOnLogin } from './hooks/syncProfile'

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
}

export default Users
