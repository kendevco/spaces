import { Access } from 'payload'
import { User } from '@/payload-types'

const isCreator: Access = ({ req, data }) => {
  const user = req.user as User | undefined

  if (!user || !data) return false

  return user.id === data.createdBy
}

export default isCreator
