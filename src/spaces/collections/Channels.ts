import { CollectionConfig, CollectionSlug } from 'payload'
import { ChannelType, CollectionSlugs } from '@/spaces/types'

const Channels: CollectionConfig = {
  slug: CollectionSlugs.CHANNELS,
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
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'space',
      type: 'relationship',
      relationTo: CollectionSlugs.SPACES as CollectionSlug,
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: Object.values(ChannelType).map(type => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: type
      })),
      defaultValue: ChannelType.TEXT,
    },
  ],
}

export default Channels
