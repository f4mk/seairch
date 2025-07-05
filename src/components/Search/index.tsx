import { useCallback, useRef, useState } from 'react'

import { Card } from '@/components/ui/card'
import { Z_INDEX_MODAL } from '@/consts/styles'
import { useDraggable } from '@/hooks/useDraggable'
import { useExitAnimation } from '@/hooks/useExitAnimation'
import { calculateModalPosition } from '@/lib/position'
import { cn } from '@/lib/utils'

import { SearchContent } from './components/SearchContent'
import { SearchHeader } from './components/SearchHeader'
import { THROTTLE_TIME } from './consts'
import { Props } from './types'

export const Search: Props = ({ onClose, initialQuery = '' }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState<{ width?: number; height?: number }>({})
  const { isClosing, handleClose } = useExitAnimation({ onClose })
  const { position, isDragging, onMouseDown } = useDraggable(modalRef, THROTTLE_TIME)

  const setModalRef = useCallback((element: HTMLDivElement | null) => {
    modalRef.current = element
    if (element) {
      setDimensions({
        width: element.clientWidth,
        height: element.clientHeight,
      })
    }
  }, [])

  const calculatedPosition = calculateModalPosition(position, dimensions)

  return (
    <div
      ref={setModalRef}
      className='fixed'
      style={{
        left: calculatedPosition.x,
        top: calculatedPosition.y,
        zIndex: Z_INDEX_MODAL,
        userSelect: isDragging ? 'none' : 'auto',
      }}
    >
      <Card
        className={cn(
          'pt-0 pb-0 h-full flex flex-col resize overflow-auto min-h-96 min-w-96 max-w-screen max-h-screen gap-0 search-modal',
        )}
        data-state={isClosing ? 'closed' : 'open'}
        style={{ width: dimensions.width || undefined, height: dimensions.height || undefined }}
      >
        <div onMouseDown={onMouseDown} className='cursor-move relative z-10'>
          <SearchHeader onClose={handleClose} />
        </div>
        <SearchContent initialQuery={initialQuery} />
      </Card>
    </div>
  )
}
