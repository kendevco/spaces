import type { CollectionAfterChangeHook, CollectionAfterLoginHook } from 'payload'
import type { User, Profile, Media } from '@/payload-types'

// For afterChange hook
export const syncProfile: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req: { payload },
}) => {
  try {
    if (operation === 'create' || operation === 'update') {
      const user = doc as User & {
        firstName?: string
        lastName?: string
        image?: {
          id: string
          url: string
        } | null
      }

      // Generate name from firstName + lastName if name is not set
      if (!user.name && (user.firstName || user.lastName)) {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
        if (fullName) {
          await payload.update({
            collection: 'users',
            id: user.id,
            data: { name: fullName },
          })
          user.name = fullName
        }
      }

      // Find existing profile
      const existingProfile = await payload.find({
        collection: 'profiles',
        where: {
          user: {
            equals: user.id,
          },
        },
        overrideAccess: true,
      })

      // Required fields for Profile creation/update
      const baseProfileData = {
        name:
          user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User',
        user: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      }

      // Create separate update and create data objects to satisfy type requirements
      const updateData = {
        ...baseProfileData,
        // For update, we can omit image if it doesn't exist
        ...(user.image?.id ? { image: user.image.id } : {}),
      }

      const createData = {
        ...baseProfileData,
        // For create, we must provide a valid image value (empty string if no image)
        image: user.image?.id || '',
      }

      if (existingProfile.docs.length > 0 && existingProfile.docs[0]?.id) {
        await payload.update({
          collection: 'profiles',
          id: existingProfile.docs[0].id,
          data: updateData,
        })
      } else {
        await payload.create({
          collection: 'profiles',
          data: createData,
        })
      }
    }

    return doc
  } catch (error) {
    console.error('Error syncing profile:', error)
    return doc
  }
}

// For afterLogin hook
export const syncProfileOnLogin: CollectionAfterLoginHook = async ({ req: { payload }, user }) => {
  // Since the afterChange hook already handles syncing,
  // simply return the user to avoid triggering duplicate updates.
  return user
}
