import { useQuery } from '@tanstack/react-query'

import { sendAIMessage } from '@/lib/messaging'

export type SearchResult = {
  content: string
}

export const performSearch = async (query: string): Promise<SearchResult> => {
  try {
    const response = await sendAIMessage([
      {
        role: 'user',
        content: query,
      },
    ])
    return { content: response.content }
  } catch (error) {
    console.error('Search error:', error)
    throw new Error(
      `Failed to get search results: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

export const useSearchQuery = (query: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => performSearch(query),
    enabled,
  })
}
