'use client'

import type { User } from '@/payload-types'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getClientSideURL } from '@/utilities/getURL'
import { useRouter } from 'next/navigation'

// eslint-disable-next-line no-unused-vars
type ResetPassword = (args: {
  password: string
  passwordConfirm: string
  token: string
}) => Promise<void>

type ForgotPassword = (args: { email: string }) => Promise<void> // eslint-disable-line no-unused-vars

type Create = (args: { email: string; password: string; passwordConfirm: string }) => Promise<void> // eslint-disable-line no-unused-vars

type Login = (args: { email: string; password: string }) => Promise<User> // eslint-disable-line no-unused-vars

type Logout = () => Promise<void>

type AuthContext = {
  create: Create
  forgotPassword: ForgotPassword
  login: Login
  logout: Logout
  resetPassword: ResetPassword
  setUser: (user: User | null) => void // eslint-disable-line no-unused-vars
  status: 'loggedIn' | 'loggedOut' | undefined
  user?: User | null
}

const Context = createContext({} as AuthContext)

export const useAuth = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>()

  // used to track the single event of logging in or logging out
  // useful for `useEffect` hooks that should only run once
  const [status, setStatus] = useState<'loggedIn' | 'loggedOut' | undefined>()
  const router = useRouter()

  const [skipAuthCheck, setSkipAuthCheck] = useState(false)

  const create = useCallback<Create>(async (args) => {
    try {
      const res = await fetch(`${getClientSideURL()}/api/users/create`, {
        body: JSON.stringify(args),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.errors?.[0]?.message ?? 'Error creating account')
      }

      const { user: createdUser } = data
      if (!createdUser) {
        throw new Error('No user data received')
      }

      setUser(createdUser)
      setStatus('loggedIn')
    } catch (e: any) {
      console.error('Create account error:', e)
      throw new Error(e?.message || 'An error occurred while creating your account.')
    }
  }, [])

  const login = useCallback<Login>(async (args) => {
    console.log('[AUTH_PROVIDER] Starting login request with email:', args.email)
    try {
      const loginUrl = `${getClientSideURL()}/api/users/login`
      console.log('[AUTH_PROVIDER] Making request to:', loginUrl)

      const res = await fetch(loginUrl, {
        body: JSON.stringify(args),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      console.log('[AUTH_PROVIDER] Response status:', res.status)
      const text = await res.text()
      console.log('[AUTH_PROVIDER] Raw response:', text)

      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error('[AUTH_PROVIDER] Failed to parse response:', e)
        throw new Error(text || 'Invalid response from server')
      }

      console.log('[AUTH_PROVIDER] Parsed response data:', data)

      if (!res.ok) {
        const errorMessage = data?.errors?.[0]?.message || 'Invalid credentials'
        console.error('[AUTH_PROVIDER] Login failed:', { status: res.status, error: errorMessage })
        throw new Error(errorMessage)
      }

      const { user: loggedInUser } = data
      if (!loggedInUser) {
        console.error('[AUTH_PROVIDER] No user data in response')
        throw new Error('No user data received')
      }

      console.log('[AUTH_PROVIDER] Login successful, setting user:', loggedInUser)
      setUser(loggedInUser)
      setStatus('loggedIn')
      return loggedInUser
    } catch (e: any) {
      console.error('[AUTH_PROVIDER] Login error:', e)
      throw new Error(e?.message || 'Invalid login credentials')
    }
  }, [])

  const logout = useCallback<Logout>(async () => {
    try {
      setSkipAuthCheck(true)
      const res = await fetch(`${getClientSideURL()}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        throw new Error('Failed to logout')
      }

      // Clear auth state
      setUser(null)
      setStatus('loggedOut')
      router.replace('/login')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }, [router])

  useEffect(() => {
    const fetchMe = async () => {
      if (skipAuthCheck) {
        setSkipAuthCheck(false)
        return
      }

      try {
        console.log('[AUTH_PROVIDER] Fetching current user')
        const meRes = await fetch(`${getClientSideURL()}/api/users/me`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        })

        if (!meRes.ok) {
          console.log('[AUTH_PROVIDER] No authenticated user found')
          setUser(null)
          setStatus('loggedOut')
          return
        }

        const data = await meRes.json()
        console.log('[AUTH_PROVIDER] Current user data:', data)

        if (data.user) {
          console.log('[AUTH_PROVIDER] Setting authenticated user')
          setUser(data.user)
          setStatus('loggedIn')
        } else {
          console.log('[AUTH_PROVIDER] No user data found')
          setUser(null)
          setStatus('loggedOut')
        }
      } catch (error) {
        console.error('[AUTH_PROVIDER] Error fetching user:', error)
        setUser(null)
        setStatus('loggedOut')
      }
    }

    void fetchMe()
  }, [])

  const forgotPassword = useCallback<ForgotPassword>(async ({ email }) => {
    try {
      const res = await fetch(`${getClientSideURL()}/api/users/forgot-password`, {
        body: JSON.stringify({ email }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const { errors } = await res.json()

      if (errors?.length || !res.ok) {
        throw new Error(errors?.[0]?.message ?? 'Error resetting password')
      }
    } catch (e) {
      throw new Error('An error occurred while resetting your password.')
    }
  }, [])

  const resetPassword = useCallback<ResetPassword>(async (args) => {
    try {
      const res = await fetch(`${getClientSideURL()}/api/users/reset-password`, {
        body: JSON.stringify(args),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      const { user: resetUser, errors } = await res.json()

      if (errors?.length || !res.ok) {
        throw new Error(errors?.[0]?.message ?? 'Error resetting password')
      }

      setUser(resetUser)
      setStatus('loggedIn')
    } catch (e) {
      throw new Error('An error occurred while resetting your password.')
    }
  }, [])

  return (
    <Context.Provider
      value={{
        create,
        forgotPassword,
        login,
        logout,
        resetPassword,
        setUser,
        status,
        user,
      }}
    >
      {children}
    </Context.Provider>
  )
}
