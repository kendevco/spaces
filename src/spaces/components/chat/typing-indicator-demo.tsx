'use client'

import React, { useState } from 'react'
import { CustomChatMessageList } from './custom-chat-message-list'
import { Button } from '@/components/ui/button'

export const TypingIndicatorDemo = () => {
  const [showTyping, setShowTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  const addTypingUser = (username: string) => {
    setTypingUsers((prev) => {
      if (!prev.includes(username)) {
        return [...prev, username]
      }
      return prev
    })
    setShowTyping(true)
  }

  const removeTypingUser = (username: string) => {
    setTypingUsers((prev) => {
      const filtered = prev.filter((user) => user !== username)
      if (filtered.length === 0) {
        setShowTyping(false)
      }
      return filtered
    })
  }

  return (
    <div className="h-96 bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-zinc-700">
        <h3 className="text-white font-semibold">Typing Indicator Demo</h3>
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => addTypingUser('Alice')}
            className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
          >
            Alice typing
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addTypingUser('Bob')}
            className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
          >
            Bob typing
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addTypingUser('Charlie')}
            className="text-zinc-300 border-zinc-600 hover:bg-zinc-700"
          >
            Charlie typing
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setTypingUsers([])
              setShowTyping(false)
            }}
          >
            Clear all
          </Button>
        </div>
      </div>

      <CustomChatMessageList
        showTypingIndicator={showTyping}
        typingText={
          typingUsers.length > 0
            ? `${typingUsers.join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`
            : ''
        }
        className="h-full"
      >
        <div className="flex flex-col space-y-2 p-4">
          <div className="bg-black/20 p-3 rounded-lg text-zinc-200">
            <p className="text-sm">Welcome to the typing indicator demo!</p>
          </div>
          <div className="bg-black/20 p-3 rounded-lg text-zinc-200">
            <p className="text-sm">Click the buttons above to simulate users typing.</p>
          </div>
          <div className="bg-black/20 p-3 rounded-lg text-zinc-200">
            <p className="text-sm">The typing indicator will appear at the bottom.</p>
          </div>
        </div>
      </CustomChatMessageList>
    </div>
  )
}
