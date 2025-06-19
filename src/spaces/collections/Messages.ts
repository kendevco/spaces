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
      type: 'textarea',
      required: false, // Allow messages with only attachments
      admin: {
        description: 'Message text content (optional if attachments are provided)',
      },
    },
    {
      name: 'contentJson',
      type: 'json',
      required: false,
      admin: {
        description: 'Rich content in JSON format (for complex formatting)',
        condition: (data) => !data?.content, // Show when no text content
      },
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'spaces-media',
      hasMany: true,
      admin: {
        description: 'Multiple file attachments (images, documents, etc.)',
      },
    },
    {
      name: 'messageType',
      type: 'select',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Image', value: 'image' },
        { label: 'File', value: 'file' },
        { label: 'Rich', value: 'rich' },
      ],
      defaultValue: 'text',
      admin: {
        position: 'sidebar',
        description: 'Type of message content',
      },
    },
    {
      name: 'formatOptions',
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'textWrap',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable text wrapping for long messages',
          },
        },
        {
          name: 'maxLines',
          type: 'number',
          defaultValue: 20,
          admin: {
            description: 'Maximum lines before show more/less toggle',
            condition: (data) => data?.formatOptions?.textWrap,
          },
        },
        {
          name: 'allowExpand',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Allow users to expand/collapse long messages',
          },
        },
      ],
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
    {
      name: 'editedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Last edit timestamp',
      },
    },
  ],
}

export default Messages
