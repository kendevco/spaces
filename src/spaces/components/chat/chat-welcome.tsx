// path: src/components/Spaces/chat/chat-welcome.tsx

import { Hash } from 'lucide-react'

interface ChatWelcomeProps {
  name: string
  type: 'channel' | 'conversation'
}

export const ChatWelcome = ({ name, type }: ChatWelcomeProps) => {
  return (
    <div className="space-y-2 px-3 mb-3">
      {type === 'channel' && (
        <div className="h-16 w-16 rounded-full bg-zinc-500 dark:bg-zinc-700 flex items-center justify-center">
          <Hash className="h-10 w-10 text-white" />
        </div>
      )}
      <p className="text-lg md:text-2xl font-bold">
        {type === 'channel' ? 'Welcome to #' : ''}
        {name}
      </p>
      <p className="text-zinc-600 dark:text-zinc-400 text-sm">
        {type === 'channel'
          ? `This is the beginning of the #${name} channel.`
          : `This is the start of your conversation with #${name}.`}
      </p>
    </div>
  )
}
