import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import { Props } from './types'

export const SearchControl: Props = ({ searchQuery, setSearchQuery, handleSearch }) => {
  return (
    <div className='flex gap-2'>
      <Textarea
        autoFocus
        placeholder='Enter your search query...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className='min-h-12 max-h-32 pr-10 resize-none break-all overflow-wrap-anywhere'
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSearch()
          }
        }}
      />
      <Button
        onClick={handleSearch}
        className='h-10 w-10 p-0 flex justify-center self-end'
        disabled={!searchQuery.trim()}
        variant='secondary'
        tabIndex={0}
        aria-label='Send search'
      >
        <Send className='size-5' />
      </Button>
    </div>
  )
}
