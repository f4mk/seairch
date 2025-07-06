import { useCallback, useEffect, useRef, useState } from 'react'
import { TrashIcon } from 'lucide-react'

import { Combobox } from '@/components/Combobox'
import { OptionType } from '@/components/Combobox/types'
import { Spinner } from '@/components/Spinner'
import { AIMessage, DialogItem } from '@/lib/messaging/types'
import { cn, generateDialogId } from '@/lib/utils'

import { DialogContent } from '../DialogContent'
import { SearchControl } from '../SearchControl'
import {
  useDeleteDialogQuery,
  useDialogsQuery,
  useSearchQuery,
  useStreamingSearchQuery,
} from './queries'
import { Props } from './types'
import { getDefaultDialog } from './utils'

const NEW_DIALOG_ID = '__NEW_DIALOG'

export const SearchContent: Props = ({ initialQuery }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [dialog, setDialog] = useState<DialogItem>(() => getDefaultDialog(NEW_DIALOG_ID))
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    data,
    error,
    isPending: isLoading,
    mutate: fetchMessages,
  } = useSearchQuery({
    onSuccess: (data) => {
      setDialog(data.dialog)
      setTimeout(() => textareaRef.current?.focus(), 0)
    },
  })

  const { mutate: refetchStreaming, isPending: isStreaming } = useStreamingSearchQuery({
    onSuccess: (data) => {
      setDialog(data.dialog)
      void refetchDialogs()
    },
  })
  const { data: dialogs, isFetching: isDialogsLoading, refetch: refetchDialogs } = useDialogsQuery()
  const { mutate: deleteDialog, isPending: isDeletingDialog } = useDeleteDialogQuery()

  useEffect(() => {
    void refetchDialogs()
  }, [refetchDialogs])

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    if (dialog.id === NEW_DIALOG_ID) {
      const newDialogId = generateDialogId()
      refetchStreaming({ dialogId: newDialogId, query: searchQuery })
      setDialog(getDefaultDialog(newDialogId))
    }

    setSearchQuery('')
  }

  const handleDialogChange = useCallback(
    (option: OptionType) => {
      if (option.id !== NEW_DIALOG_ID) {
        void fetchMessages({ dialogId: option.id })
      }
      setDialog(option)
    },
    [fetchMessages],
  )

  const handleDelete = (option: OptionType) => {
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
  }

  let messages: AIMessage[] = []

  if (error) {
    messages = [{ role: 'assistant', content: `Error: ${error.message}` }]
  } else if (dialog.id === NEW_DIALOG_ID || data?.dialog?.id !== dialog.id) {
    messages = []
  } else {
    messages = data?.messages || []
  }

  const dialogOptions = [
    getDefaultDialog(NEW_DIALOG_ID),
    ...(dialogs?.map((d) => ({
      ...d,
      iconButton: <TrashIcon className='w-4 h-4' />,
    })) ?? []),
  ]

  return (
    <div
      className={cn(
        'flex-1 pt-0 px-6 pb-4 flex h-full flex-col gap-4 overflow-hidden',
        messages.length ? 'justify-between' : 'justify-end',
      )}
    >
      {isLoading ? (
        <div className='flex-1 flex items-center justify-center'>
          <Spinner />
        </div>
      ) : messages.length > 0 || dialog.id !== NEW_DIALOG_ID ? (
        <DialogContent messages={messages} isStreaming={isStreaming} currentDialogId={dialog.id} />
      ) : (
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-sm text-muted-foreground'>Search anything...</p>
        </div>
      )}
      <SearchControl
        ref={textareaRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
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
