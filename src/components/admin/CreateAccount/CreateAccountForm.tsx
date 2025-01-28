'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  passwordConfirm: string
  firstName: string
  lastName: string
  name: string // This will be auto-generated from firstName + lastName
}

export const CreateAccountForm: React.FC = () => {
  const router = useRouter()
  const { create } = useAuth()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit: handleFormSubmit, watch } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.passwordConfirm) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // Combine firstName and lastName for the name field
      const formData = {
        ...data,
        name: `${data.firstName} ${data.lastName}`.trim(),
        role: 'user', // Default role
      }

      await create(formData)
      toast({
        title: 'Success',
        description: 'Account created successfully!',
      })
      router.push('/spaces')
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create account',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleFormSubmit(onSubmit)} className="max-w-md space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            {...register('firstName', { required: true })}
            type="text"
            className="bg-[#383A40] text-zinc-200 border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            {...register('lastName', { required: true })}
            type="text"
            className="bg-[#383A40] text-zinc-200 border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
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
      <div className="space-y-2">
        <Label htmlFor="passwordConfirm">Confirm Password</Label>
        <Input
          id="passwordConfirm"
          {...register('passwordConfirm', { required: true })}
          type="password"
          className="bg-[#383A40] text-zinc-200 border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
        {loading ? 'Creating Account...' : 'Create Account'}
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
        <span className="text-zinc-400">Already have an account? </span>
        <Link href="/login" className="text-indigo-500 hover:text-indigo-400 font-medium">
          Login here
        </Link>
      </div>
    </form>
  )
}
