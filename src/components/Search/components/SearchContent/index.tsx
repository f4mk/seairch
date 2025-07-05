import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { TrashIcon } from 'lucide-react'

import { Combobox } from '@/components/Combobox'
import { OptionType } from '@/components/Combobox/types'
import { Spinner } from '@/components/Spinner'
import { AIMessage, DialogItem } from '@/lib/messaging/types'
import { cn } from '@/lib/utils'

import { DialogContent } from '../DialogContent'
import { SearchControl } from '../SearchControl'
import { useDeleteDialogQuery, useDialogsQuery, useSearchQuery } from './queries'
import { Props } from './types'
import { getDefaultDialog } from './utils'

export const SearchContent: Props = ({ initialQuery }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [dialog, setDialog] = useState<DialogItem>(getDefaultDialog())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { isFetching, isLoading, data, error, refetch } = useSearchQuery(searchQuery, dialog.id, {
    placeholderData: keepPreviousData,
  })

  const { data: dialogs, isFetching: isDialogsLoading, refetch: refetchDialogs } = useDialogsQuery()
  const { mutate: deleteDialog, isPending: isDeletingDialog } = useDeleteDialogQuery()

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    refetch().then((result) => {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
      if (result.isError) return
      setDialog(result.data?.dialog || getDefaultDialog())
      setSearchQuery('')
      refetchDialogs()
    })
  }

  useEffect(() => {
    if (dialog.id) {
      refetch()
    }
  }, [dialog.id, refetch])

  let messages: AIMessage[]
  if (error) {
    messages = [{ role: 'assistant' as const, content: `Error: ${error.message}` }]
  } else if (dialog.id) {
    messages = data?.messages || []
  } else {
    messages = []
  }

  const handleDelete = useCallback(
    (option: OptionType) => {
      deleteDialog(option.id, {
        onSuccess: () => {
          refetchDialogs()
        },
      })
    },
    [deleteDialog, refetchDialogs],
  )

  const dialogOptions: OptionType[] = useMemo(
    () =>
      [getDefaultDialog(), ...(dialogs || [])].map((d) =>
        d.id ? { ...d, iconButton: <TrashIcon className='w-4 h-4' /> } : d,
      ),
    [dialogs],
  )
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
      ) : messages.length > 0 ? (
        <DialogContent messages={messages} isLoading={isFetching} currentDialogId={dialog.id} />
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
        isLoading={isFetching}
      />
      <div className='w-[50%]'>
        <Combobox
          options={dialogOptions}
          onChange={(option) => setDialog(option)}
          onButtonClick={handleDelete}
          disabled={isDialogsLoading || isDeletingDialog}
          selectedKey={dialog.id}
        />
      </div>
    </div>
  )
}
