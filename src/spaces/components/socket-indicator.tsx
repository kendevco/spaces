'use client'

import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff } from 'lucide-react'
import { useEffect, useState } from 'react'

export const SocketIndicator = () => {
  const [isConnected, setIsConnected] = useState(true)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [activityStatus, setActivityStatus] = useState('Active')
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsLargeScreen(window.innerWidth >= 768)
    }

    checkScreenWidth()
    window.addEventListener('resize', checkScreenWidth)

    return () => window.removeEventListener('resize', checkScreenWidth)
  }, [])

  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now())
      setActivityStatus('Active')
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
    }
  }, [])

  useEffect(() => {
    const updateStatus = () => {
      const inactiveTime = Date.now() - lastActivity
      if (inactiveTime < 60000) {
        setActivityStatus('Active')
      } else if (inactiveTime < 300000) {
        setActivityStatus('Idle')
      } else if (inactiveTime < 900000) {
        setActivityStatus('Inactive')
      } else {
        setActivityStatus('Away')
      }
    }

    const intervalId = setInterval(updateStatus, 1000)
    return () => clearInterval(intervalId)
  }, [lastActivity])

  // Health check polling
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/messages/sse/health', {
          credentials: 'include',
        })
        setIsConnected(response.ok)
      } catch (error) {
        console.error('[HEALTH] Check failed:', error)
        setIsConnected(false)
      }
    }

    // Initial check
    checkHealth()

    // Poll every 30 seconds
    const intervalId = setInterval(checkHealth, 30000)

    return () => clearInterval(intervalId)
  }, [])

  if (!isLargeScreen) {
    return (
      <div className="flex items-center justify-center h-6 w-6">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-emerald-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-yellow-500 animate-pulse" />
        )}
      </div>
    )
  }

  return (
    <Badge
      variant="outline"
      className={
        isConnected
          ? 'bg-emerald-600 text-white border-none'
          : 'bg-yellow-600 text-white border-none animate-pulse'
      }
    >
      {isConnected ? 'Live' : 'Connecting...'} | {activityStatus}
    </Badge>
  )
}
