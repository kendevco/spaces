"use client"

import React from "react"
import { cn } from "@/utilities/cn"
import { Textarea } from "./textarea"

interface ChatInputProps {
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  autoFocus?: boolean
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({
    value,
    onChange,
    onKeyDown,
    placeholder = "Type a message...",
    className,
    disabled = false,
    autoFocus = false,
    ...props
  }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Handle Enter key to submit (without Shift)
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        onKeyDown?.(event)
      } else {
        onKeyDown?.(event)
      }
    }

    return (
      <Textarea
        ref={ref}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          "min-h-[44px] max-h-32 resize-none border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring rounded-lg p-3",
          "placeholder:text-muted-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)

ChatInput.displayName = "ChatInput"

export { ChatInput }
