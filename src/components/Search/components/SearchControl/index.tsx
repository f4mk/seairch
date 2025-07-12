import { KeyboardEvent, useCallback, useRef } from 'react'
import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { KEY_ENTER } from '@/consts/keyboard'
import { useAllowEvents } from '@/hooks/useAllowEvents'

import { Props } from './types'

export const SearchControl: Props = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  isLoading = false,
  ref,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const allowEvent = useAllowEvents()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      allowEvent(e.nativeEvent)
      if (e.key === KEY_ENTER && !e.shiftKey) {
        e.preventDefault()
        onSearch()
      }
    },
    [onSearch, allowEvent],
  )

  return (
    <div className='flex gap-2' ref={containerRef}>
      <Textarea
        ref={ref}
        autoFocus
        placeholder='Enter your query...'
        value={searchQuery}
        onChange={(e) => {
          onSearchQueryChange(e.target.value)
        }}
        className='overflow-wrap-anywhere max-h-32 min-h-12 resize-none pr-10 break-all'
        rows={1}
        disabled={isLoading}
        onKeyDown={handleKeyDown}
      />
      <Button
        onClick={onSearch}
        className='flex h-10 w-10 justify-center self-end p-0'
        disabled={!searchQuery.trim() || isLoading}
        variant='secondary'
        tabIndex={0}
        aria-label='Send query'
      >
        <Send className='size-5' />
      </Button>
    </div>
  )
}
