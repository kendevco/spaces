'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/Auth'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'

type FormData = {
  email: string
  password: string
}

export const LoginForm: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit: handleFormSubmit } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      const user = await login(data)
      if (!user) {
        throw new Error('Login failed')
      }

      const redirect = searchParams.get('redirect')
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      })
      router.push(redirect || '/spaces')
    } catch (err: any) {
      console.error('Login error:', err)
      toast({
        title: 'Error',
        description: err?.message || 'Failed to login',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleFormSubmit(onSubmit)} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          {...register('email', { required: true })}
          type="email"
          className="bg-[#383A40] text-zinc-200 border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          {...register('password', { required: true })}
          type="password"
          className="bg-[#383A40] text-zinc-200 border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div className="flex items-center justify-end">
        <Link href="/recover-password" className="text-sm text-indigo-500 hover:text-indigo-400">
          Forgot your password?
        </Link>
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
        {loading ? 'Signing in...' : 'Sign in'}
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#383A40] px-2 text-zinc-400">Or</span>
        </div>
      </div>
      <div className="text-center text-sm">
        <span className="text-zinc-400">Don&apos;t have an account? </span>
        <Link href="/create-account" className="text-indigo-500 hover:text-indigo-400 font-medium">
          Create one here
        </Link>
      </div>
    </form>
  )
}
