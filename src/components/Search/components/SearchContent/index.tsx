import { useCallback, useEffect, useRef, useState } from 'react'
import { TrashIcon } from 'lucide-react'

import { Combobox } from '@/components/Combobox'
import { OptionType } from '@/components/Combobox/types'
import { AIMessage, DialogItem } from '@/lib/messaging/types'
import { cn, generateDialogId } from '@/lib/utils'

import { useStreamingContext } from '../../hooks'
import { SearchContentWrapper } from '../SearchContentWrapper'
import { SearchControl } from '../SearchControl'
import { NEW_DIALOG_ID } from './consts'
import { useData } from './queries'
import { Props } from './types'
import { getDefaultDialog } from './utils'

export const SearchContent: Props = ({ initialQuery }) => {
  const { setIsStreaming } = useStreamingContext()
  const [dialog, setDialog] = useState<DialogItem>(() => getDefaultDialog(NEW_DIALOG_ID))
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const queryRef = useRef(searchQuery)

  queryRef.current = searchQuery

  const {
    dialogsData,
    isDialogsLoading,
    isLoading,
    searchQueryData,
    searchQueryError,
    fetchMessages,
    resetSearchQuery,
    resetStreamingQuery,
    requestStream,
    isStreaming,
    streamingError,
    deleteDialog,
    isDeletingDialog,
    refetchDialogs,
  } = useData({
    onSearchSuccess: (data) => {
      setDialog(data.dialog)
      setTimeout(() => textareaRef.current?.focus(), 0)
    },
    onSearchError: () => {
      void refetchDialogs()
    },
    onStreamingSuccess: (data) => {
      setDialog(data.dialog)
      void refetchDialogs()
    },
    onStreamingError: () => {
      void refetchDialogs()
    },
  })

  const handleSearch = useCallback(() => {
    if (!queryRef.current.trim()) return

    if (dialog.id === NEW_DIALOG_ID) {
      const newDialogId = generateDialogId()
      requestStream({ dialogId: newDialogId, query: queryRef.current })
      setDialog(getDefaultDialog(newDialogId))
    } else {
      requestStream({ dialogId: dialog.id, query: queryRef.current })
    }

    setSearchQuery('')
  }, [dialog.id, requestStream, setDialog])

  const handleDialogChange = useCallback(
    async (option: OptionType) => {
      resetSearchQuery()
      resetStreamingQuery()

      if (option.id !== NEW_DIALOG_ID) {
        void fetchMessages({ dialogId: option.id })
      }
      setDialog(option)
    },
    [fetchMessages, resetSearchQuery, resetStreamingQuery],
  )

  const handleDelete = useCallback(
    (option: OptionType) => {
      deleteDialog(option.id, {
        onSuccess: () => {
          void refetchDialogs()

          const isDeletingCurrent = option.id === dialog.id

          if (isDeletingCurrent) {
            const newDialog = getDefaultDialog(NEW_DIALOG_ID)
            setDialog(newDialog)
          } else if (dialog.id !== NEW_DIALOG_ID) {
            void fetchMessages({ dialogId: dialog.id })
          }
        },
      })
    },
    [deleteDialog, dialog.id, fetchMessages, refetchDialogs],
  )

  useEffect(() => {
    setIsStreaming(isStreaming)
  }, [isStreaming, setIsStreaming])

  useEffect(() => {
    void refetchDialogs()
  }, [refetchDialogs])

  let messages: AIMessage[] = []

  if (searchQueryError || streamingError) {
    const errorMessage =
      searchQueryError?.message || streamingError?.message || 'Unknown error occurred'
    const formattedError = `**Error:** ${errorMessage}`
    messages = [{ role: 'assistant', content: formattedError }]
  } else if (dialog.id === NEW_DIALOG_ID || searchQueryData?.dialog?.id !== dialog.id) {
    messages = []
  } else {
    messages = searchQueryData?.messages || []
  }

  const dialogOptions = [
    getDefaultDialog(NEW_DIALOG_ID),
    ...(dialogsData?.map((d) => ({
      ...d,
      iconButton: <TrashIcon className='h-4 w-4' />,
    })) ?? []),
  ]

  return (
    <div
      className={cn(
        'flex h-full flex-1 flex-col gap-4 overflow-hidden px-6 pt-0 pb-4',
        messages.length ? 'justify-between' : 'justify-end',
      )}
    >
      <SearchContentWrapper
        isLoading={isLoading}
        messages={messages}
        dialogId={dialog.id}
        isStreaming={isStreaming}
      />
      <SearchControl
        ref={textareaRef}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
        isLoading={isLoading || isStreaming}
      />
      <div className='w-[50%]'>
        <Combobox
          options={dialogOptions}
          onChange={handleDialogChange}
          onButtonClick={handleDelete}
          disabled={isDialogsLoading || isDeletingDialog || isStreaming}
          selectedKey={dialog.id}
        />
      </div>
    </div>
  )
}
