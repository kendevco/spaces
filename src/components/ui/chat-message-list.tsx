'use client'

import React from 'react'
import { cn } from '@/utilities/cn'

interface ChatMessageListProps {
  children: React.ReactNode
  className?: string
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ children, className, ...props }, ref) => (
    <div className={cn('flex flex-col gap-3 p-4 overflow-y-auto', className)} ref={ref} {...props}>
      {children}
    </div>
  ),
)

ChatMessageList.displayName = 'ChatMessageList'

export { ChatMessageList }
