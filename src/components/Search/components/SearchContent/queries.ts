import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from '@tanstack/react-query'

import { deleteDialog, fetchAIMessage, getDialogs, searchAIMessageStream } from '@/lib/messaging'
import { DialogItem } from '@/lib/messaging/types'

import { SearchResult } from './types'

export const performFetch = async (dialogId: string): Promise<SearchResult> => {
  try {
    const response = await fetchAIMessage({ dialogId })

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

export const performStreamingSearch = async (
  dialogId: string,
  query: string,
): Promise<{ dialog: DialogItem }> => {
  try {
    const response = await searchAIMessageStream({ dialogId, query })

    return response
  } catch (error) {
    throw new Error(
      `Failed to start streaming search: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

export const useSearchQuery = (
  options?: Partial<UseMutationOptions<SearchResult, Error, { dialogId: string }>>,
) => {
  return useMutation({
    mutationFn: ({ dialogId }) => performFetch(dialogId),
    ...options,
  })
}

export const useStreamingSearchQuery = (
  options?: Partial<
    UseMutationOptions<{ dialog: DialogItem }, Error, { dialogId: string; query: string }>
  >,
) => {
  return useMutation({
    mutationFn: ({ dialogId, query }) => performStreamingSearch(dialogId, query),
    ...options,
  })
}

export const fetchDialogs = async (): Promise<DialogItem[]> => {
  const response = await getDialogs()
  return response.dialogs
}

export const useDialogsQuery = (options?: Partial<UseQueryOptions<DialogItem[], Error>>) => {
  return useQuery({
    queryKey: ['dialogs'],
    queryFn: fetchDialogs,
    ...options,
  })
}

export const removeDialog = async (dialogId: string): Promise<void> => {
  await deleteDialog(dialogId)
}

export const useDeleteDialogQuery = (
  options?: Partial<UseMutationOptions<void, Error, string>>,
) => {
  return useMutation({
    mutationFn: (dialogId: string) => removeDialog(dialogId),
    ...options,
  })
}
