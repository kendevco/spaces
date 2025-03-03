import { type CollectionConfig } from 'payload'
import { authenticated } from '../../access/authenticated'
import { MediaCategories } from '../constants/media'
import { CollectionSlugs } from '../types'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const SpacesMedia: CollectionConfig = {
  slug: CollectionSlugs.SPACES_MEDIA,
  admin: {
    group: 'Spaces',
    useAsTitle: 'alt',
  },
  access: {
    create: authenticated,
    read: () => true,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    staticDir: path.resolve(dirname, '../../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      options: ['profile', 'space', 'message'],
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'caption',
      type: 'richText',
    },
  ],
}

export default SpacesMedia
