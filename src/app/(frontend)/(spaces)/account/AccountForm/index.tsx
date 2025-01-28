'use client'

import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  firstName: string
  lastName: string
  role?: string
  password: string
  passwordConfirm: string
}

type ExtendedUser = User & {
  aiPreferences?: {
    contextDepth: number
    includeSystemMessages: boolean
    customInstructions?: string
  }
}

export const AccountForm: React.FC = () => {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { setUser, user, status } = useAuth()
  const [changePassword, setChangePassword] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const router = useRouter()

  // Update debug info in useEffect to avoid hydration mismatch
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setDebugInfo(JSON.stringify({
        user,
        status,
        serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
        timestamp: new Date().toISOString(),
      }, null, 2))
    }
  }, [user, status])

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!user?.id) return

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, {
          body: JSON.stringify({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            ...(data.password ? {
              password: data.password,
              passwordConfirm: data.passwordConfirm,
            } : {}),
          }),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PATCH',
        })

        const json = await response.json()

        if (!response.ok) {
          throw new Error(json.errors?.[0]?.message || 'There was a problem updating your account.')
        }

        setUser(json.doc)
        setSuccess('Successfully updated account.')
        setError('')
        setChangePassword(false)
        reset({
          email: json.doc.email,
          firstName: json.doc.firstName,
          lastName: json.doc.lastName,
          password: '',
          passwordConfirm: '',
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'There was a problem updating your account.')
      }
    },
    [user, setUser, reset],
  )

  useEffect(() => {
    console.log('AccountForm useEffect - Current user:', user, 'Status:', status)

    const fetchUserDirectly = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const data = await res.json()
        console.log('Direct fetch response:', data)

        if (data.user) {
          setUser(data.user)
          return
        }

        // Try getting user by ID if available
        if (data.doc?.id || data.id) {
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${data.doc?.id || data.id}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          const userData = await userRes.json()
          if (userData.doc) {
            setUser(userData.doc)
          }
        }
      } catch (e) {
        console.error('Error fetching user directly:', e)
      }
    }

    if (user === null) {
      console.log('No user, redirecting to login')
      router.push(
        `/login?error=${encodeURIComponent(
          'You must be logged in to view this page.',
        )}&redirect=${encodeURIComponent('/account')}`,
      )
      return
    }

    // If user is undefined, try fetching directly
    if (user === undefined) {
      console.log('User data still loading, trying direct fetch...')
      fetchUserDirectly()
      return
    }

    // Once user is loaded, reset form to have default values
    console.log('Setting form data from user:', {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    })

    reset({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: '',
      passwordConfirm: '',
    })
  }, [user, router, reset, setUser])

  // Add form state logging
  useEffect(() => {
    const subscription = watch((value, { name, type }) =>
      console.log('Form field changed:', { name, type, value })
    )
    return () => subscription.unsubscribe()
  }, [watch])

  // Show loading state while user data is being fetched
  if (user === undefined || status === undefined) {
    return (
      <div className="max-w-xl">
        <div className="flex flex-col gap-4">
          <p>Loading account information...</p>
          <div className="h-2 w-full bg-gray-200 rounded">
            <div className="h-2 bg-blue-500 rounded animate-pulse" style={{ width: '60%' }}></div>
          </div>
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
              <p>Debug Info:</p>
              <pre>{debugInfo}</pre>
              <div className="mt-2">
                <p>Try refreshing the page if loading takes too long.</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show message if not logged in
  if (status === 'loggedOut' || user === null) {
    return (
      <div className="max-w-xl">
        <p className="text-red-500">You must be logged in to view this page.</p>
      </div>
    )
  }

  return (
    <form className="max-w-xl" onSubmit={handleSubmit(onSubmit)}>
      <Message className="" error={error} success={success} />
      {!changePassword ? (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p className="">
              {'Change your account details below, or '}
              <Button
                className="px-0 text-inherit underline"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                click here
              </Button>
              {' to change your password.'}
            </p>
          </div>
          <div className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" {...register('email', { required: true })} required type="email" />
          </div>
          <div className="mb-4">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register('firstName', { required: true })} required />
          </div>
          <div className="mb-4">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register('lastName', { required: true })} required />
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p>
              {'Change your password below, or '}
              <Button
                className="px-0 text-inherit underline"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                cancel
              </Button>
              {' to go back.'}
            </p>
          </div>
          <div className="mb-4">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              {...register('password', {
                required: true,
                minLength: {
                  value: 8,
                  message: 'Please enter a password with at least 8 characters',
                },
              })}
              required
              type="password"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="passwordConfirm">Confirm Password</Label>
            <Input
              id="passwordConfirm"
              {...register('passwordConfirm', {
                required: true,
                validate: value =>
                  value === password.current || 'The passwords do not match',
              })}
              required
              type="password"
            />
          </div>
        </Fragment>
      )}
      <Button type="submit">
        {isLoading ? 'Processing...' : changePassword ? 'Change Password' : 'Update Account'}
      </Button>
    </form>
  )
}
