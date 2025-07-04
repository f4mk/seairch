import { useRef, useState } from 'react'

import { Card } from '@/components/ui/card'
import { Z_INDEX_MODAL } from '@/consts/styles'
import { useDraggable } from '@/hooks/useDraggable'

import { SearchControl } from './components/SearchControl'
import { SearchHeader } from './components/SearchHeader'
import { TextContent } from './components/TextContent'
import { Props } from './types'

export const Search: Props = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [textContent, setTextContent] = useState('')
  const modalRef = useRef<HTMLDivElement>(null)
  const { position, isDragging, handleMouseDown } = useDraggable(modalRef)

  const handleSearch = () => {
    setTextContent(searchQuery)
  }

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
      <Card className='pt-0 h-full flex flex-col resize overflow-auto min-h-48 min-w-96 max-w-screen max-h-screen'>
        <SearchHeader onClose={onClose} handleMouseDown={handleMouseDown} />

        <div className='flex-1 p-6 flex flex-col gap-4 min-h-0'>
          {textContent && <TextContent text={textContent} />}
          <SearchControl
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
          />
        </div>
      </Card>
    </div>
  )
}
