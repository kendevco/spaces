'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from '@/spaces/utilities/toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FileUpload } from './file-upload'
import type { SafeUser } from '@/spaces/types/user'
import { MediaCategory } from '@/spaces/types'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  imageUrl: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface OnboardingFormProps {
  user: SafeUser
}

export function OnboardingForm({ user }: OnboardingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
      imageUrl: user.imageUrl || '',
    },
  })

  const onSubmit = async (values: FormData) => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/users/onboard', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      toast.success('Profile updated!')
      router.refresh()
      router.push('/spaces')
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <FormControl>
                <FileUpload
                  endpoint="profileImage"
                  value={field.value}
                  onChange={field.onChange}
                  category={MediaCategory.PROFILE}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="Enter your display name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isLoading} type="submit" className="w-full">
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </form>
    </Form>
  )
}
