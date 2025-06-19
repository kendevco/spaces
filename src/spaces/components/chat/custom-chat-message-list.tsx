'use client'

import React from 'react'
import { cn } from '@/utilities/cn'

interface CustomChatMessageListProps {
  children: React.ReactNode
  className?: string
  showTypingIndicator?: boolean
  typingText?: string
}

const CustomChatMessageList = React.forwardRef<HTMLDivElement, CustomChatMessageListProps>(
  ({ children, className, showTypingIndicator = false, typingText = '', ...props }, ref) => (
    <div
      className={cn(
        'flex flex-col flex-1 overflow-y-auto',
        // Minimal padding for dense layout
        'px-4',
        // Remove bottom padding completely - let individual messages handle their own spacing
        'pb-0',
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}

      {/* Typing indicator section with minimal spacing */}
      {showTypingIndicator && typingText && (
        <div className="flex items-center gap-2 py-1 px-3 mt-1 mb-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
          </div>
          <span className="text-sm text-zinc-400">{typingText}</span>
        </div>
      )}
    </div>
  ),
)

CustomChatMessageList.displayName = 'CustomChatMessageList'

export { CustomChatMessageList }
