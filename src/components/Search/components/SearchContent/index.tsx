import { useCallback, useEffect, useRef, useState } from 'react'
import { TrashIcon } from 'lucide-react'

import { Combobox } from '@/components/Combobox'
import { OptionType } from '@/components/Combobox/types'
import { DialogItem } from '@/lib/messaging/types'
import { cn, generateDialogId } from '@/lib/utils'

import { useStreamingContext } from '../../hooks'
import { SearchContentWrapper } from '../SearchContentWrapper'
import { SearchControl } from '../SearchControl'
import { NEW_DIALOG_ID } from './consts'
import { useFocus } from './hooks'
import { useDialogs, useMessages, useStreaming } from './queries'
import { Props } from './types'
import { getDefaultDialog, getMessages } from './utils'

export const SearchContent: Props = ({ initialQuery }) => {
  const { setIsStreaming } = useStreamingContext()
  const [dialog, setDialog] = useState<DialogItem>(() => getDefaultDialog(NEW_DIALOG_ID))
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const queryRef = useRef(searchQuery)
  queryRef.current = searchQuery

  const { textareaRef, handleFocus } = useFocus()

  const {
    dialogsData,
    isDialogsLoading,
    deleteDialog,
    isDeletingDialog,
    deleteDialogError,
    refetchDialogs,
  } = useDialogs({
    onDeleteDialogError: () => {
      void refetchDialogs()
    },
  })

  const { searchQueryData, searchQueryError, isLoading, fetchMessages, resetSearchQuery } =
    useMessages({
      onSearchSuccess: (data) => setDialog(data.dialog),
      onSearchError: () => {
        void refetchDialogs()
      },
    })

  const { requestStream, isStreaming, streamingError, resetStreamingQuery } = useStreaming({
    onStreamingSuccess: (data) => {
      setDialog(data.dialog)
      void refetchDialogs()
      handleFocus()
    },
    onStreamingError: () => {
      void refetchDialogs()
      handleFocus()
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

  const messages = getMessages(
    dialog,
    searchQueryData,
    deleteDialogError || searchQueryError || streamingError,
  )

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
      <div className='w-[50%] max-w-60'>
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
