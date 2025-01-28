import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '../payload-types'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'

export async function getMeUser(args?: {
  nullUserRedirect?: string
  validUserRedirect?: string
}): Promise<{
  token: string | null
  user: User | null
}> {
  const { nullUserRedirect, validUserRedirect } = args || {}
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token && nullUserRedirect) {
    redirect(nullUserRedirect)
  }

  if (!token) {
    return { token: null, user: null }
  }

  try {
    const payload = await getPayloadClient()
    const { user } = await payload.auth({
      headers: new Headers({
        Authorization: `JWT ${token}`,
      }),
    })

    if (!user?.id && nullUserRedirect) {
      redirect(nullUserRedirect)
    }

    if (user?.id && validUserRedirect) {
      redirect(validUserRedirect)
    }

    return { token, user }
  } catch (error) {
    console.error('Error in getMeUser:', error)
    if (nullUserRedirect) {
      redirect(nullUserRedirect)
    }
    return { token: null, user: null }
  }
}
