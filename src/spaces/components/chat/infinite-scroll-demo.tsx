'use client'

import React from 'react'
import InfiniteScroll from '@/components/ui/infinite-scroll'
import { Loader2 } from 'lucide-react'

interface DemoMessage {
  id: number
  content: string
  author: string
  timestamp: string
}

const DemoMessage = ({ message }: { message: DemoMessage }) => {
  return (
    <div className="flex w-full gap-3 p-3 hover:bg-black/10 transition-colors">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {message.author[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-white">{message.author}</span>
          <span className="text-xs text-zinc-400">{message.timestamp}</span>
        </div>
        <div className="text-zinc-200 text-sm mt-1">{message.content}</div>
      </div>
    </div>
  )
}

export const InfiniteScrollDemo = () => {
  const [page, setPage] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(true)
  const [messages, setMessages] = React.useState<DemoMessage[]>([])

  const next = async () => {
    setLoading(true)

    // Simulate API delay
    setTimeout(async () => {
      const newMessages: DemoMessage[] = Array.from({ length: 20 }, (_, i) => ({
        id: page * 20 + i,
        content: `This is message ${page * 20 + i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        author: `User ${((page * 20 + i) % 5) + 1}`,
        timestamp: new Date(Date.now() - (page * 20 + i) * 60000).toLocaleTimeString(),
      }))

      setMessages((prev) => [...newMessages, ...prev])
      setPage((prev) => prev + 1)

      // Simulate end of messages after 5 pages
      if (page >= 4) {
        setHasMore(false)
      }
      setLoading(false)
    }, 800)
  }

  // Load initial messages
  React.useEffect(() => {
    next()
  }, [])

  return (
    <div className="h-[500px] w-full bg-gradient-to-br from-[#7364c0] to-[#02264a] dark:from-[#000C2F] dark:to-[#003666] rounded-lg overflow-hidden">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Chat Demo with Infinite Scroll</h3>
          <p className="text-sm text-zinc-300">Scroll to top to load older messages</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <InfiniteScroll
            hasMore={hasMore}
            isLoading={loading}
            next={next}
            threshold={0.8}
            reverse={true}
            rootMargin="50px"
          >
            {/* Loading indicator at top */}
            {hasMore && (
              <div className="flex justify-center py-4">
                {loading ? (
                  <div className="flex items-center gap-2 text-zinc-300 bg-black/20 px-3 py-2 rounded-full">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading older messages...
                  </div>
                ) : (
                  <div className="text-zinc-400 text-sm bg-black/20 px-3 py-2 rounded-full">
                    Scroll up for more messages
                  </div>
                )}
              </div>
            )}
          </InfiniteScroll>

          {/* Messages */}
          <div className="pb-4">
            {messages.map((message) => (
              <DemoMessage key={message.id} message={message} />
            ))}
          </div>

          {/* End indicator */}
          {!hasMore && (
            <div className="flex justify-center py-4">
              <div className="text-zinc-400 text-sm bg-black/20 px-3 py-2 rounded-full">
                You&apos;ve reached the beginning of the conversation
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
