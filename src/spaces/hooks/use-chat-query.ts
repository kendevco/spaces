import qs from 'query-string'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Message, DirectMessage } from '@/payload-types'

interface ChatQueryParams {
  queryKey: string
  apiUrl: string
  paramKey: 'channelId' | 'conversationId'
  paramValue: string
}

interface MessageResponse {
  items: (Message | DirectMessage)[]
  nextCursor: string | null
}

export const useChatQuery = ({ queryKey, apiUrl, paramKey, paramValue }: ChatQueryParams) => {
  const fetchMessages = async ({ pageParam = undefined }: { pageParam?: string }) => {
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: {
          cursor: pageParam,
          [paramKey]: paramValue,
        },
      },
      { skipNull: true },
    )

    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error('Failed to fetch messages')
    }

    return res.json() as Promise<MessageResponse>
  }

  return useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  })
}
