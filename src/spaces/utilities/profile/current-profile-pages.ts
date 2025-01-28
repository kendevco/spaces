import { getPayloadClient } from '../payload/getPayloadClient'
import { checkSession } from '../auth/checkSession'
import type {
  Profile as PayloadProfile,
  Media as PayloadMedia,
  User as PayloadUser,
} from '@/payload-types'
import type { User } from '@/payload-types'
import { MemberRole } from '@/spaces/types'
import { logInfo, logError } from '@/spaces/utilities/logger'

// Define extended profile type that includes media
interface ExtendedProfile extends PayloadProfile {
  media?: Array<{
    relationTo: 'spaces-media'
    value: PayloadMedia | string
  }> | null
}

// Define extended user type that includes profile
interface ExtendedUser extends User {
  profile?: {
    id: string
    name: string
    imageUrl: string | null
    email: string
  }
}

export async function getCurrentProfilePages(): Promise<{
  profile: PayloadProfile | null
  user: ExtendedUser | null
}> {
  try {
    logInfo('getCurrentProfilePages', 'Checking session')
    const payloadUser = await checkSession()

    if (!payloadUser) {
      logInfo('getCurrentProfilePages', 'No user in session')
      return { profile: null, user: null }
    }

    const typedPayloadUser = payloadUser as PayloadUser
    const payload = await getPayloadClient()

    logInfo('getCurrentProfilePages', 'Fetching profile', { userId: payloadUser.id })
    const { docs: profiles } = await payload.find({
      collection: 'profiles',
      where: {
        'user.id': {
          equals: payloadUser.id,
        },
      },
      depth: 2,
      limit: 1,
    })

    if (!profiles.length || !profiles[0]) {
      logInfo('getCurrentProfilePages', 'No profile found', { userId: payloadUser.id })
      return { profile: null, user: null }
    }

    logInfo('getCurrentProfilePages', 'Profile found', {
      userId: payloadUser.id,
      profileId: profiles[0].id,
    })

    const profile = profiles[0] as ExtendedProfile
    const profileMedia = profile?.media?.find((m) => m.relationTo === 'spaces-media')?.value
    const profileImage =
      typeof profileMedia === 'string'
        ? await payload.findByID({
            collection: 'spaces-media',
            id: profileMedia,
          })
        : (profileMedia as PayloadMedia | undefined)

    // Transform to User with proper type assertions
    const user: ExtendedUser = {
      ...typedPayloadUser,
      name: typedPayloadUser.name || 'Unknown User',
      email: typedPayloadUser.email,
      role: typedPayloadUser.role || MemberRole.MEMBER,
      profile: profile
        ? {
            id: profile.id,
            name: profile.name || '',
            imageUrl: profileImage?.url || null,
            email: typedPayloadUser.email,
          }
        : undefined,
    }

    return {
      profile,
      user,
    }
  } catch (error) {
    logError('getCurrentProfilePages', 'Error getting profile', { error })
    return { profile: null, user: null }
  }
}
