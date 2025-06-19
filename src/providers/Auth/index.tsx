'use client'

import type { User } from '@/payload-types'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getClientSideURL } from '@/utilities/getURL'
import { useRouter } from 'next/navigation'

 
type ResetPassword = (args: {
  password: string
  passwordConfirm: string
  token: string
}) => Promise<void>

type ForgotPassword = (args: { email: string }) => Promise<void>  

type Create = (args: { email: string; password: string; passwordConfirm: string }) => Promise<void>  

type Login = (args: { email: string; password: string }) => Promise<User>  

type Logout = () => Promise<void>

type AuthState = {
  error: string | null
  success: string | null
  status: 'loggedIn' | 'loggedOut' | undefined
  user?: User | null
}

type AuthContext = {
  create: Create
  forgotPassword: ForgotPassword
  login: Login
  logout: Logout
  resetPassword: ResetPassword
  setUser: (user: User | null) => void  
  status: 'loggedIn' | 'loggedOut' | undefined
  user?: User | null
  error: string | null
  success: string | null
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
  const [state, setState] = useState<AuthState>({
    error: null,
    success: null,
    status: undefined,
    user: undefined,
  })
  const [isLoading, setIsLoading] = useState(true)
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

      setState(prev => ({
        ...prev,
        user: createdUser,
        status: 'loggedIn',
        error: null,
        success: 'Successfully created account'
      }))
    } catch (e: any) {
      console.error('Create account error:', e)
      setState(prev => ({
        ...prev,
        error: e instanceof Error ? e.message : 'An error occurred while creating your account.',
        success: null
      }))
    }
  }, [])

  const login = useCallback<Login>(async ({ email, password }) => {
    try {
      console.log('[AUTH] Attempting login with URL:', getClientSideURL())
      const res = await fetch(`${getClientSideURL()}/api/users/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      console.log('[AUTH] Login response:', { status: res.status })

      const data = await res.json()

      if (!res.ok) {
        // Handle locked account specifically
        if (data?.errors?.[0]?.message?.includes('locked')) {
          setState(prev => ({
            ...prev,
            error: 'Account is temporarily locked. Please try again later.',
            success: null
          }))
        } else {
          setState(prev => ({
            ...prev,
            error: data?.errors?.[0]?.message || 'Invalid login credentials',
            success: null
          }))
        }
        return null
      }

      if (!data.user) {
        setState(prev => ({
          ...prev,
          error: 'No user data received',
          success: null
        }))
        return null
      }

      setState(prev => ({
        ...prev,
        user: data.user,
        status: 'loggedIn',
        error: null,
        success: 'Successfully logged in'
      }))

      return data.user
    } catch (error) {
      console.error('[AUTH] Login error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        success: null
      }))
      return null
    }
  }, [])

  const logout = useCallback<Logout>(async () => {
    try {
      setSkipAuthCheck(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        // Don't throw error on 401 (already logged out)
        if (res.status !== 401) {
          throw new Error('Unable to sign out. Please try again.')
        }
      }

      // Clear auth state
      setState(prev => ({
        ...prev,
        user: null,
        status: 'loggedOut',
        error: null,
        success: null
      }))
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
        setIsLoading(false)
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
          if (meRes.status === 401) {
            console.log('[AUTH_PROVIDER] User not authenticated')
            setState(prev => ({
              ...prev,
              user: null,
              status: 'loggedOut',
              error: null,
              success: null
            }))
          } else {
            console.error('[AUTH_PROVIDER] Error response:', meRes.status)
            throw new Error(`HTTP error! status: ${meRes.status}`)
          }
          setIsLoading(false)
          return
        }

        const data = await meRes.json()
        console.log('[AUTH_PROVIDER] Current user data:', data)

        if (data.user) {
          console.log('[AUTH_PROVIDER] Setting authenticated user')
          setState(prev => ({
            ...prev,
            user: data.user,
            status: 'loggedIn',
            error: null,
            success: 'Successfully authenticated'
          }))
        } else {
          console.log('[AUTH_PROVIDER] No user data found')
          setState(prev => ({
            ...prev,
            user: null,
            status: 'loggedOut',
            error: null,
            success: null
          }))
        }
      } catch (error) {
        console.error('[AUTH_PROVIDER] Error fetching user:', error)
        setState(prev => ({
          ...prev,
          user: null,
          status: 'loggedOut',
          error: error instanceof Error ? error.message : 'An error occurred',
          success: null
        }))
      } finally {
        setIsLoading(false)
      }
    }

    void fetchMe()
  }, [skipAuthCheck])

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

      setState(prev => ({
        ...prev,
        user: resetUser,
        status: 'loggedIn',
        error: null,
        success: 'Successfully reset password'
      }))
    } catch (e) {
      throw new Error('An error occurred while resetting your password.')
    }
  }, [])

  // Don't render children until initial auth check is complete
  if (isLoading) {
    return null // Or a loading spinner
  }

  return (
    <Context.Provider
      value={{
        ...state,
        create,
        forgotPassword,
        login,
        logout,
        resetPassword,
        setUser: (user) => setState(prev => ({ ...prev, user })),
      }}
    >
      {children}
    </Context.Provider>
  )
}
