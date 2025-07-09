import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { KEY_ENTER } from '@/consts/keyboard'

import { Props } from './types'

export const SearchControl: Props = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isLoading = false,
  ref,
}) => {
  return (
    <div className='flex gap-2'>
      <Textarea
        ref={ref}
        autoFocus
        placeholder='Enter your query...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className='overflow-wrap-anywhere max-h-32 min-h-12 resize-none pr-10 break-all'
        rows={1}
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === KEY_ENTER && !e.shiftKey) {
            e.preventDefault()
            handleSearch()
          }
        }}
      />
      <Button
        onClick={handleSearch}
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
