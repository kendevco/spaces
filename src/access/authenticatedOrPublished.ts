import { Access, Where } from 'payload'

export const authenticatedOrPublished: Access = ({ req: { user } }): Where | boolean => {
  if (user) return true

  return {
    or: [
      {
        _status: {
          equals: 'published',
        },
      } as Where,
      {
        publishedAt: {
          exists: true,
          not: {
            equals: null,
          },
        },
      } as Where,
    ],
  }
}
