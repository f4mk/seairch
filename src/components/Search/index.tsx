import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Z_INDEX_MODAL } from '@/consts/styles'
import { useDraggable } from '@/hooks/useDraggable'
import { cn } from '@/lib/utils'

import { SearchControl } from './components/SearchControl'
import { SearchHeader } from './components/SearchHeader'
import { TextContent } from './components/TextContent'
import { useSearchQuery } from './queries'
import { Props } from './types'

export const Search: Props = ({ onClose, initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const modalRef = useRef<HTMLDivElement>(null)
  const { position, isDragging, handleMouseDown } = useDraggable(modalRef)

  const { isLoading, data, error, refetch } = useSearchQuery(searchQuery, false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    refetch()
  }

  const textContent = error
    ? `Error: Failed to get search results:${error.message}`
    : data?.content || ''

  return (
    <div
      ref={modalRef}
      className='fixed'
      style={{
        left: position.x ?? '50%',
        top: position.y ?? '50%',
        transform: position.x !== null ? 'none' : 'translate(-50%, -50%)',
        zIndex: Z_INDEX_MODAL,
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      <Card
        className={cn(
          'pt-0 h-full flex flex-col resize overflow-auto min-w-96 max-w-screen max-h-screen gap-0',
          textContent ? 'min-h-96' : 'min-h-48',
        )}
        style={{ width: modalRef.current?.clientWidth, height: modalRef.current?.clientHeight }}
      >
        <div onMouseDown={handleMouseDown} className='cursor-move relative z-10'>
          <SearchHeader onClose={onClose} />
        </div>
        <div
          className={cn(
            'flex-1 pt-0 px-6 pb-6 flex h-full flex-col gap-4 overflow-hidden',
            textContent ? 'justify-between' : 'justify-end',
          )}
        >
          {isLoading ? (
            <div className='flex-1 flex items-center justify-center'>
              <Loader2 className='w-4 h-4 animate-spin' />
            </div>
          ) : (
            textContent && <TextContent text={textContent} />
          )}
          <SearchControl
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            isLoading={isLoading}
          />
        </div>
      </Card>
    </div>
  )
}
