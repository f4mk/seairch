import { useRef, useState } from 'react'
import { keepPreviousData } from '@tanstack/react-query'
import { TrashIcon } from 'lucide-react'

import { Combobox } from '@/components/Combobox'
import { Spinner } from '@/components/Spinner'
import { cn } from '@/lib/utils'

import { DialogContent } from '../DialogContent'
import { SearchControl } from '../SearchControl'
import { useSearchQuery } from './queries'
import { Props } from './types'

type Option = {
  id: string
  label: string
  iconButton?: React.ReactElement
}

const chats: Option[] = [
  { id: '1', label: 'Chat One', iconButton: <TrashIcon className='w-4 h-4' /> },
  { id: '2', label: 'Chat Two' },
  { id: '3', label: 'Chat Three', iconButton: <TrashIcon className='w-4 h-4' /> },
]

export const SearchContent: Props = ({ initialQuery }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [dialogId, setDialogId] = useState<string | undefined>()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isFetching, isLoading, data, error, refetch } = useSearchQuery(searchQuery, dialogId, {
    placeholderData: keepPreviousData,
  })

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    refetch().then((result) => {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 0)
      if (result.isError) return
      if (result.data?.dialogId) {
        setDialogId(result.data.dialogId)
      }
      setSearchQuery('')
    })
  }

  const messages = error
    ? [{ role: 'assistant' as const, content: `Error: ${error.message}` }]
    : data?.messages || []

  // TODO: add later
  const [selectedChat, setSelectedChat] = useState<Option | null>(null)
  function handleDelete(option: Option) {
    alert(`Delete chat ${option.label}`)
  }

  return (
    <div
      className={cn(
        'flex-1 pt-0 px-6 pb-6 flex h-full flex-col gap-4 overflow-hidden',
        messages.length ? 'justify-between' : 'justify-end',
      )}
    >
      {isLoading ? (
        <div className='flex-1 flex items-center justify-center'>
          <Spinner />
        </div>
      ) : messages.length > 0 ? (
        <DialogContent messages={messages} isLoading={isFetching} />
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
      <div>
        <Combobox
          options={chats}
          value={selectedChat}
          onChange={setSelectedChat}
          onButtonClick={handleDelete}
          onChangeState={() => {}}
        />
      </div>
    </div>
  )
}
