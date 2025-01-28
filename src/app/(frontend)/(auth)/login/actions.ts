'use server'

import { getMeUser } from '@/utilities/getMeUser'

export async function getLoginPageData() {
  const { user } = await getMeUser()
  return { user }
}
