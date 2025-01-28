import { GlobalConfig } from 'payload'

export interface CurrentUserType {
  user: string | { id: string }
  lastActive: Date
  onboarded: boolean
}

export const CurrentUser: GlobalConfig = {
  slug: 'current-user',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'lastActive',
      type: 'date',
      required: true,
    },
    {
      name: 'onboarded',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}

// Add to Payload's global types
declare module 'payload' {
  export interface Globals {
    'current-user': CurrentUserType
  }
}
