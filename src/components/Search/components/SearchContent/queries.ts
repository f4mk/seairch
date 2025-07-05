import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { sendAIMessage } from '@/lib/messaging'

import { SearchResult } from './types'

export const performSearch = async (query: string, dialogId?: string): Promise<SearchResult> => {
  try {
    const response = await sendAIMessage(
      [
        {
          role: 'user',
          content: query,
        },
      ],
      {
        dialogId,
      },
    )
    return {
      messages: response.messages,
      dialogId: response.dialogId,
    }
  } catch (error) {
    throw new Error(
      `Failed to get search results: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

export const useSearchQuery = (
  query: string,
  dialogId?: string,
  options?: Partial<UseQueryOptions<SearchResult, Error>>,
) => {
  return useQuery({
    queryKey: ['search', query, dialogId],
    queryFn: () => performSearch(query, dialogId),
    enabled: false,
    staleTime: 0,
    gcTime: 0,
    ...options,
  })
}
