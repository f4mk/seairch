import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { MSG_GET_DIALOGS } from '@/consts/messages'
import { sendAIMessage, sendToBackground } from '@/lib/messaging'
import { DialogItem } from '@/lib/messaging/types'

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
    ...options,
  })
}

export const fetchDialogs = async (): Promise<DialogItem[]> => {
  const response = await sendToBackground<{ dialogs: DialogItem[] }>(MSG_GET_DIALOGS)
  const dialogs = new Set(response.dialogs)
  console.log('dialogs', Array.from(dialogs))
  return Array.from(dialogs).map((dialog) => ({
    id: dialog.id,
    // TODO: get dialog label from background
    label: dialog.id,
  }))
}

export const useDialogsQuery = (options?: Partial<UseQueryOptions<DialogItem[], Error>>) => {
  return useQuery({
    queryKey: ['dialogs'],
    queryFn: fetchDialogs,
    ...options,
  })
}
