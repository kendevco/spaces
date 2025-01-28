'use client'

import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'

type FormData = {
  email: string
}

export const RecoverPasswordForm: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit: handleFormSubmit, reset } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/forgot-password`,
        {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error('Failed to send recovery email')
      }

      toast({
        title: 'Success',
        description: 'Recovery email sent! Please check your inbox.',
      })
      reset()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to send recovery email',
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
      <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
        {loading ? 'Sending Recovery Email...' : 'Send Recovery Email'}
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#383A40] px-2 text-zinc-400">Or</span>
        </div>
      </div>
      <div className="flex flex-col space-y-2 text-center text-sm">
        <div>
          <span className="text-zinc-400">Remember your password? </span>
          <Link href="/login" className="text-indigo-500 hover:text-indigo-400 font-medium">
            Sign in here
          </Link>
        </div>
        <div>
          <span className="text-zinc-400">Don&apos;t have an account? </span>
          <Link
            href="/create-account"
            className="text-indigo-500 hover:text-indigo-400 font-medium"
          >
            Create one here
          </Link>
        </div>
      </div>
    </form>
  )
}
