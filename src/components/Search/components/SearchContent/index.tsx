import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TrashIcon } from 'lucide-react'

import { Combobox } from '@/components/Combobox'
import { OptionType } from '@/components/Combobox/types'
import { AIMessage, DialogItem } from '@/lib/messaging/types'
import { cn, generateDialogId } from '@/lib/utils'

import { DialogContent } from '../DialogContent'
import { SearchControl } from '../SearchControl'
import { useDeleteDialogQuery, useDialogsQuery, useSearchQuery } from './queries'
import { Props } from './types'
import { getDefaultDialog } from './utils'

const DEFAULT_DIALOG_ID = '__NEW_DIALOG'
export const SearchContent: Props = ({ initialQuery }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [dialog, setDialog] = useState<DialogItem>(getDefaultDialog(DEFAULT_DIALOG_ID))
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    data,
    error,
    isPending: isLoading,
    mutate: refetch,
  } = useSearchQuery({
    onSuccess: (data) => {
      setDialog(data.dialog)
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
      setSearchQuery('')
      void refetchDialogs()
    },
  })
  const { data: dialogs, isFetching: isDialogsLoading, refetch: refetchDialogs } = useDialogsQuery()
  const { mutate: deleteDialog, isPending: isDeletingDialog } = useDeleteDialogQuery()

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return
    }

    refetch({
      query: searchQuery,
      dialogId: dialog.id === DEFAULT_DIALOG_ID ? generateDialogId() : dialog.id,
    })
  }

  const handleDialogChange = useCallback(
    (option: OptionType) => {
      setDialog(option)
      if (option.id === DEFAULT_DIALOG_ID) {
        return
      }

      void refetch({ dialogId: option.id })
    },
    [refetch],
  )

  const handleDelete = useCallback(
    (option: OptionType) => {
      deleteDialog(option.id, {
        onSuccess: () => {
          void refetchDialogs()
          if (option.id === dialog.id || dialog.id === DEFAULT_DIALOG_ID) {
            setDialog(getDefaultDialog(DEFAULT_DIALOG_ID))
          } else {
            void refetch({ dialogId: dialog.id })
          }
        },
      })
    },
    [deleteDialog, refetch, refetchDialogs, dialog.id],
  )

  useEffect(() => {
    void refetchDialogs()
  }, [refetchDialogs])

  const dialogOptions: OptionType[] = useMemo(() => {
    const existingDialogs = (dialogs || []).map((d) => ({
      ...d,
      iconButton: <TrashIcon className='w-4 h-4' />,
    }))

    if (existingDialogs.some((d) => d.id === dialog.id)) {
      return [getDefaultDialog(DEFAULT_DIALOG_ID), ...existingDialogs]
    }

    return [dialog, ...existingDialogs]
  }, [dialogs, dialog])

  let messages: AIMessage[]
  if (error) {
    messages = [{ role: 'assistant' as const, content: `Error: ${error.message}` }]
  } else if (dialog.id === DEFAULT_DIALOG_ID) {
    messages = []
  } else {
    messages = data?.messages || []
  }

  return (
    <div
      className={cn(
        'flex-1 pt-0 px-6 pb-4 flex h-full flex-col gap-4 overflow-hidden',
        messages.length ? 'justify-between' : 'justify-end',
      )}
    >
      {messages.length > 0 ? (
        <DialogContent messages={messages} isLoading={isLoading} currentDialogId={dialog.id} />
      ) : (
        <div className='flex-1 flex items-center justify-center'>
          <p className='text-sm text-muted-foreground'>How can I help you?</p>
        </div>
      )}
      <SearchControl
        ref={textareaRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        isLoading={isLoading}
      />
      <div className='w-[50%]'>
        <Combobox
          options={dialogOptions}
          onChange={handleDialogChange}
          onButtonClick={handleDelete}
          disabled={isDialogsLoading || isDeletingDialog}
          selectedKey={dialog.id}
        />
      </div>
    </div>
  )
}
