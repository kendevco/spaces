import { CollectionSlug, GlobalConfig } from 'payload'
import { isAdmin } from '../../access/isAdmin'
import { CollectionSlugs } from '@/spaces/types'

export const Settings: GlobalConfig = {
  slug: 'settings',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    group: 'Spaces',
  },
  fields: [
    {
      name: 'menuItems',
      type: 'array',
      admin: {
        description: 'Add menu items to the navigation',
      },
      fields: [
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'page',
          options: [
            {
              label: 'Page',
              value: 'page',
            },
            {
              label: 'Custom URL',
              value: 'custom',
            },
          ],
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'The label for the menu item',
          },
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'page',
          },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'custom',
          },
        },
      ],
    },
    {
      name: 'footerItems',
      type: 'array',
      admin: {
        description: 'Add menu items to the footer',
      },
      fields: [
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'page',
          options: [
            {
              label: 'Page',
              value: 'page',
            },
            {
              label: 'Custom URL',
              value: 'custom',
            },
          ],
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'The label for the menu item',
          },
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'page',
          },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'custom',
          },
        },
      ],
    },
  ],
}
