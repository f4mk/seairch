import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, TrashIcon } from 'lucide-react'

import { Combobox } from '@/components/Combobox'
import { OptionType } from '@/components/Combobox/types'
import { Spinner } from '@/components/Spinner'
import { resetAI } from '@/lib/messaging'
import { AIMessage, DialogItem } from '@/lib/messaging/types'
import { getAIConfig } from '@/lib/storage/ai'
import { cn, generateDialogId, initAIConfig } from '@/lib/utils'

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

export const SearchContent: Props = ({ initialQuery, configNames }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [dialog, setDialog] = useState<DialogItem>(() => getDefaultDialog(NEW_DIALOG_ID))
  const [configName, setConfigName] = useState(configNames[0])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { data: dialogs, isFetching: isDialogsLoading, refetch: refetchDialogs } = useDialogsQuery()
  const {
    data,
    error,
    isPending: isLoading,
    mutate: fetchMessages,
    reset: resetSearchQuery,
  } = useSearchQuery({
    onSuccess: (data) => {
      setDialog(data.dialog)
      setTimeout(() => textareaRef.current?.focus(), 0)
    },
    onError: () => {
      void refetchDialogs()
    },
  })

  const {
    mutate: requestStream,
    isPending: isStreaming,
    error: streamingError,
    reset: resetStreamingQuery,
  } = useStreamingSearchQuery({
    onSuccess: (data) => {
      setDialog(data.dialog)
      void refetchDialogs()
    },
    onError: () => {
      void refetchDialogs()
    },
  })
  const { mutate: deleteDialog, isPending: isDeletingDialog } = useDeleteDialogQuery()

  useEffect(() => {
    void refetchDialogs()
  }, [refetchDialogs])

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    if (dialog.id === NEW_DIALOG_ID) {
      const newDialogId = generateDialogId()
      requestStream({ dialogId: newDialogId, query: searchQuery })
      setDialog(getDefaultDialog(newDialogId))
    } else {
      requestStream({ dialogId: dialog.id, query: searchQuery })
    }

    setSearchQuery('')
  }

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

  const handleConfigChange = async (option: { id: string; label: string }) => {
    try {
      await resetAI()

      setConfigName(option.id)

      const config = await getAIConfig(option.id)
      if (!config) return

      void initAIConfig(config)
    } catch (error) {
      console.error('Error resetting AI service:', error)
    }
  }

  let messages: AIMessage[] = []

  if (error || streamingError) {
    const errorMessage = error?.message || streamingError?.message || 'Unknown error occurred'
    const formattedError = `**Error:** ${errorMessage}`
    messages = [{ role: 'assistant', content: formattedError }]
  } else if (dialog.id === NEW_DIALOG_ID || data?.dialog?.id !== dialog.id) {
    messages = []
  } else {
    messages = data?.messages || []
  }

  const dialogOptions = [
    getDefaultDialog(NEW_DIALOG_ID),
    ...(dialogs?.map((d) => ({
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
      {isLoading ? (
        <div className='flex flex-1 items-center justify-center'>
          <Spinner />
        </div>
      ) : messages.length > 0 || dialog.id !== NEW_DIALOG_ID ? (
        <DialogContent messages={messages} isStreaming={isStreaming} currentDialogId={dialog.id} />
      ) : (
        <div className='flex flex-1 items-center justify-center'>
          <Search className='h-8 w-8 text-muted-foreground select-none' />
        </div>
      )}
      <SearchControl
        ref={textareaRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        isLoading={isLoading || isStreaming}
      />
      <div className='flex gap-4'>
        <div className='w-[20%]'>
          <Combobox
            options={configNames.map((name) => ({
              id: name,
              label: name,
            }))}
            onChange={handleConfigChange}
            disabled={isDialogsLoading || isDeletingDialog || isStreaming}
            selectedKey={configName}
          />
        </div>
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
    </div>
  )
}
