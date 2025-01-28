'use client'

import { useEffect, useState } from 'react'
import type { User } from '@/payload-types'
import { checkSession } from '@/spaces/utilities/auth/checkSession'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await checkSession()
        setUser(user)
      } catch (error) {
        console.error('[USE_USER_ERROR]', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading }
}
