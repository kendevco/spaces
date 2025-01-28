import type { CollectionAfterChangeHook } from 'payload'
import type { User } from '@/payload-types'
import { MemberRole } from '@/spaces/types'

export const addToHomeSpace: CollectionAfterChangeHook<User> = async ({
  doc,
  operation,
  req: { payload },
}) => {
  // Only run on user creation
  if (operation !== 'create') return doc

  try {
    // Find Home space
    const homeSpaces = await payload.find({
      collection: 'spaces',
      where: {
        name: {
          equals: 'Home',
        },
      },
      limit: 1,
    })

    const homeSpace = homeSpaces.docs[0]
    if (!homeSpace) {
      console.error('Home space not found')
      return doc
    }

    // Create member record
    const member = await payload.create({
      collection: 'members',
      data: {
        user: doc.id,
        space: homeSpace.id,
        role: MemberRole.MEMBER,
        email: doc.email,
      },
    })

    // Update space with new member
    await payload.update({
      collection: 'spaces',
      id: homeSpace.id,
      data: {
        members: [...(homeSpace.members || []), member.id],
      },
    })

    return doc
  } catch (error) {
    console.error('Error adding user to Home space:', error)
    return doc
  }
}
