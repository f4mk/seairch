import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query'

import { MSG_DELETE_DIALOG, MSG_GET_DIALOGS } from '@/consts/messages'
import { sendAIMessage, sendToBackground } from '@/lib/messaging'
import { AIMessage, DialogItem } from '@/lib/messaging/types'

import { SearchResult } from './types'

export const performSearch = async (query: string, dialogId: string): Promise<SearchResult> => {
  try {
    const message: AIMessage | undefined = query ? { role: 'user', content: query } : undefined
    const response = await sendAIMessage({ message, dialogId })
    return {
      messages: response.messages,
      dialog: response.dialog,
    }
  } catch (error) {
    throw new Error(
      `Failed to get search results: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

export const useSearchQuery = (
  query: string,
  dialogId: string,
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
  return response.dialogs
}

export const useDialogsQuery = (options?: Partial<UseQueryOptions<DialogItem[], Error>>) => {
  return useQuery({
    queryKey: ['dialogs'],
    queryFn: fetchDialogs,
    ...options,
  })
}

export const deleteDialog = async (dialogId: string): Promise<void> => {
  await sendToBackground(MSG_DELETE_DIALOG, { dialogId })
}

export const useDeleteDialogQuery = (
  options?: Partial<UseMutationOptions<void, Error, string>>,
) => {
  return useMutation({
    mutationFn: (dialogId: string) => deleteDialog(dialogId),
    ...options,
  })
}
