import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { authenticated } from '../../access/authenticated'
import { anyone } from '../../access/anyone'
import { CollectionSlugs } from '../types'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const SpacesMedia: CollectionConfig = {
  slug: CollectionSlugs.SPACES_MEDIA,
  labels: {
    singular: 'Spaces Media',
    plural: 'Spaces Media',
  },
  admin: {
    group: 'Spaces',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }: { rootFeatures: any }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Profile Image', value: 'profile' },
        { label: 'Space Image', value: 'space' },
        { label: 'Message Attachment', value: 'message' },
      ],
      defaultValue: 'message',
      admin: {
        position: 'sidebar',
        description: 'Categorize the media for organization',
      },
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../../public/spaces-media'),
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
}

export default SpacesMedia
