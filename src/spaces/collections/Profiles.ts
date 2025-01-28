import { CollectionConfig } from 'payload'

const Profiles: CollectionConfig = {
  slug: 'profiles',
  admin: {
    useAsTitle: 'name',
    group: 'Spaces',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
  ],
}

export default Profiles
