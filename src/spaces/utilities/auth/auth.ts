// 
import { headers } from 'next/headers'
import { getPayloadClient } from '../payload/getPayloadClient'
import type { User } from '@/payload-types'

export async function loginUser(email: string, password: string) {
  const payload = await getPayloadClient()
  return await payload.login({
    collection: 'users',
    data: {
      email,
      password,
    },
  })
}
