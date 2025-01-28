import type { Access } from 'payload'
import type { User } from '@/payload-types'
import { isAdminInHomeSpace } from './isAdminInHomeSpace'

const isAdminOrCreator: Access = async ({ req: { user }, data }) => {
  if (!user) return false

  // Check if user is admin in home space
  const isAdmin = await isAdminInHomeSpace(user as User)
  if (isAdmin) return true

  // Check if user is the creator
  if (data?.createdBy && data.createdBy.toString() === user.id) return true

  return false
}

export default isAdminOrCreator
