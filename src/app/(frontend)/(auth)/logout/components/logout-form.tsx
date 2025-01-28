'use client'

import { useAuth } from '@/providers/Auth'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import Link from 'next/link'

export function LogoutForm() {
  const { logout } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function performLogout() {
      try {
        await logout()
        toast({
          title: 'Disconnected from the Spaces Network',
          description: 'Your consciousness has been safely untethered from the system.',
        })
      } catch (error) {
        toast({
          title: 'Connection Already Terminated',
          description: 'Your neural link to the system was already disconnected.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    void performLogout()
  }, [logout, toast])

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-6 text-center">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Initiating Disconnect
          </h1>
          <p className="text-sm text-muted-foreground">
            Please stand by while we safely terminate your connection to the Spaces Network...
          </p>
        </div>
        <div className="flex justify-center">
          <Icons.spinner className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-6 text-center">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Connection Terminated</h1>
        <p className="text-sm text-muted-foreground">
          Your neural interface with the Spaces Network has been safely disconnected. The system
          will remember you.
        </p>
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#383A40] px-2 text-zinc-400">Select Your Next Journey</span>
        </div>
      </div>
      <div className="flex flex-col space-y-4">
        <Button asChild variant="default" className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="/login">
            <Icons.login className="mr-2 h-4 w-4" />
            Re-establish Connection
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-zinc-700 hover:bg-zinc-700">
          <Link href="/">
            <Icons.home className="mr-2 h-4 w-4" />
            Return to Base Station
          </Link>
        </Button>
      </div>
    </div>
  )
}
