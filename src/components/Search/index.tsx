import { useCallback, useRef, useState } from 'react'

import { Card } from '@/components/ui/card'
import { Z_INDEX_MODAL } from '@/consts/styles'
import { useDraggable } from '@/hooks/useDraggable'
import { cn } from '@/lib/utils'

import { SearchContent } from './components/SearchContent'
import { SearchHeader } from './components/SearchHeader'
import { THROTTLE_TIME } from './consts'
import { Props } from './types'

export const Search: Props = ({ onClose, initialQuery = '' }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState<{ width?: number; height?: number }>({})
  const { position, isDragging, handleMouseDown } = useDraggable(modalRef, THROTTLE_TIME)

  const setModalRef = useCallback((element: HTMLDivElement | null) => {
    modalRef.current = element
    if (element) {
      setDimensions({
        width: element.clientWidth,
        height: element.clientHeight,
      })
    }
  }, [])

  return (
    <div
      ref={setModalRef}
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
          'pt-0 h-full flex flex-col resize overflow-auto min-h-96 min-w-96 max-w-screen max-h-screen gap-0',
        )}
        style={{ width: dimensions.width || undefined, height: dimensions.height || undefined }}
      >
        <div onMouseDown={handleMouseDown} className='cursor-move relative z-10'>
          <SearchHeader onClose={onClose} />
        </div>
        <SearchContent initialQuery={initialQuery} />
      </Card>
    </div>
  )
}
