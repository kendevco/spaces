import type { User } from '@/payload-types'
import type { Space } from '@/payload-types'

export type SafeUser = {
  id: string
  name: string | null
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'member'
  imageUrl: string | null
  spaces: string[] | null
  createdAt: string
  updatedAt: string
}

export const transformToSafeUser = (user: User | string): SafeUser => {
  // If user is a string, throw a meaningful error
  if (typeof user === 'string') {
    throw new Error('Invalid user data: Expected User object but received string')
  }

  // Ensure we have a valid user object
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid user data: User object is required')
  }

  return {
    id: user.id,
    name: user.name || null,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role === 'admin' ? 'admin' : 'member',
    imageUrl: null,
    spaces: user.spaces
      ? Array.isArray(user.spaces)
        ? user.spaces.map((space) => (typeof space === 'string' ? space : (space as Space).id))
        : [typeof user.spaces === 'string' ? user.spaces : (user.spaces as Space).id]
      : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
