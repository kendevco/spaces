'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface TypingUser {
  userId: string
  username: string
  timestamp: number
}

interface UseTypingIndicatorProps {
  chatId: string
  currentUserId: string
  onTypingStart?: (chatId: string, userId: string) => void
  onTypingStop?: (chatId: string, userId: string) => void
}

export const useTypingIndicator = ({
  chatId,
  currentUserId,
  onTypingStart,
  onTypingStop,
}: UseTypingIndicatorProps) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const cleanupIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Clean up old typing indicators (remove users who haven't typed in 5 seconds)
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(() => {
      const now = Date.now()
      setTypingUsers((prev) => prev.filter((user) => now - user.timestamp < 5000))
    }, 1000)

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
    }
  }, [])

  // Add a user to typing indicators
  const addTypingUser = useCallback(
    (userId: string, username: string) => {
      if (userId === currentUserId) return // Don't show current user as typing

      setTypingUsers((prev) => {
        const existing = prev.find((user) => user.userId === userId)
        if (existing) {
          // Update timestamp for existing user
          return prev.map((user) =>
            user.userId === userId ? { ...user, timestamp: Date.now() } : user,
          )
        }
        // Add new typing user
        return [...prev, { userId, username, timestamp: Date.now() }]
      })
    },
    [currentUserId],
  )

  // Remove a user from typing indicators
  const removeTypingUser = useCallback((userId: string) => {
    setTypingUsers((prev) => prev.filter((user) => user.userId !== userId))
  }, [])

  // Handle current user typing
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true)
      onTypingStart?.(chatId, currentUserId)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      onTypingStop?.(chatId, currentUserId)
    }, 3000)
  }, [isTyping, chatId, currentUserId, onTypingStart, onTypingStop])

  // Stop typing immediately
  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    if (isTyping) {
      setIsTyping(false)
      onTypingStop?.(chatId, currentUserId)
    }
  }, [isTyping, chatId, currentUserId, onTypingStop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current)
      }
      if (isTyping) {
        onTypingStop?.(chatId, currentUserId)
      }
    }
  }, [isTyping, chatId, currentUserId, onTypingStop])

  return {
    typingUsers: typingUsers.map((user) => user.username),
    isTyping,
    addTypingUser,
    removeTypingUser,
    handleTyping,
    stopTyping,
    hasTypingUsers: typingUsers.length > 0,
  }
}
