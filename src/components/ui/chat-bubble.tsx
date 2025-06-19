'use client'

import React from 'react'
import { cn } from '@/utilities/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

// ChatBubble variant styles
const chatBubbleVariant = cva('flex gap-2 max-w-[60%]', {
  variants: {
    variant: {
      received: 'self-start',
      sent: 'self-end flex-row-reverse',
    },
    layout: {
      default: '',
      ai: '',
    },
  },
  defaultVariants: {
    variant: 'received',
    layout: 'default',
  },
})

const chatBubbleMessageVariant = cva('p-4 rounded-lg break-words', {
  variants: {
    variant: {
      received: 'bg-secondary text-secondary-foreground',
      sent: 'bg-primary text-primary-foreground',
    },
    layout: {
      default: '',
      ai: 'border border-border',
    },
  },
  defaultVariants: {
    variant: 'received',
    layout: 'default',
  },
})

interface ChatBubbleProps extends VariantProps<typeof chatBubbleVariant> {
  children: React.ReactNode
  className?: string
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ children, variant, layout, className, ...props }, ref) => (
    <div className={cn(chatBubbleVariant({ variant, layout, className }))} ref={ref} {...props}>
      {children}
    </div>
  ),
)
ChatBubble.displayName = 'ChatBubble'

interface ChatBubbleMessageProps extends VariantProps<typeof chatBubbleMessageVariant> {
  children: React.ReactNode
  isLoading?: boolean
  className?: string
}

const ChatBubbleMessage = React.forwardRef<HTMLDivElement, ChatBubbleMessageProps>(
  ({ children, variant, layout, isLoading = false, className, ...props }, ref) => (
    <div
      className={cn(chatBubbleMessageVariant({ variant, layout, className }))}
      ref={ref}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  ),
)
ChatBubbleMessage.displayName = 'ChatBubbleMessage'

interface ChatBubbleAvatarProps {
  src?: string
  fallback?: string
  className?: string
}

const ChatBubbleAvatar: React.FC<ChatBubbleAvatarProps> = ({ src, fallback, className }) => (
  <Avatar className={cn('flex-shrink-0', className)}>
    <AvatarImage src={src} alt="Avatar" />
    <AvatarFallback>{fallback}</AvatarFallback>
  </Avatar>
)

interface ChatBubbleActionProps {
  icon: React.ReactNode
  onClick?: () => void
  className?: string
}

const ChatBubbleAction: React.FC<ChatBubbleActionProps> = ({ icon, onClick, className }) => (
  <button
    onClick={onClick}
    className={cn(
      'opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-accent',
      className,
    )}
  >
    {icon}
  </button>
)

export {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAvatar,
  ChatBubbleAction,
  chatBubbleVariant,
  chatBubbleMessageVariant,
}
