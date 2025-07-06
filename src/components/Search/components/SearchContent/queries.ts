import { useEffect, useMemo, useRef } from 'react'
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'

import { MSG_AI_STREAM_CHUNK } from '@/consts/messages'
import { deleteDialog, getDialogs, sendAIMessage } from '@/lib/messaging'
import { AIMessage, DialogItem, StreamMessage } from '@/lib/messaging/types'

import { SearchResult } from './types'

export const performSearch = async (dialogId: string, query?: string): Promise<SearchResult> => {
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
  options?: Partial<UseMutationOptions<SearchResult, Error, { query?: string; dialogId: string }>>,
) => {
  return useMutation({
    mutationFn: ({ query, dialogId }) => performSearch(dialogId, query),
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

export function useStreamingSearchReactQuery(
  query: string,
  dialogId: string,
  options?: Partial<UseQueryOptions<SearchResult, Error>>,
) {
  const queryClient = useQueryClient()
  const contentRef = useRef('')
  const queryKey = useMemo(() => ['search', query, dialogId], [query, dialogId])

  useEffect(() => {
    const handleChunk = (e: Event) => {
      const customEvent = e as CustomEvent<StreamMessage>
      const message = customEvent.detail

      if (message.type === MSG_AI_STREAM_CHUNK && message.payload.dialogId === dialogId) {
        const chunk = message.payload.chunk
        contentRef.current += chunk

        queryClient.setQueryData(queryKey, (oldData: SearchResult) => {
          if (!oldData) return oldData
          const oldMessages = oldData.messages || []
          if (
            oldMessages.length === 0 ||
            oldMessages[oldMessages.length - 1].role !== 'assistant'
          ) {
            return {
              ...oldData,
              messages: [...oldMessages, { role: 'assistant', content: contentRef.current }],
            }
          } else {
            const newMessages = [...oldMessages]
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content: contentRef.current,
            }
            return { ...oldData, messages: newMessages }
          }
        })
      }
    }

    document.addEventListener(MSG_AI_STREAM_CHUNK, handleChunk as EventListener)
    return () => {
      document.removeEventListener(MSG_AI_STREAM_CHUNK, handleChunk as EventListener)
      contentRef.current = ''
    }
  }, [dialogId, query, queryClient, queryKey])

  return useQuery({
    queryKey,
    queryFn: () => performSearch(query, dialogId),
    enabled: false,
    ...options,
  })
}
