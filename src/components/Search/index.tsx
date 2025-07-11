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
import { SearchProvider } from './context'
import { Props } from './types'

export const Search: Props = ({ onClose, initialQuery = '', configNames, initialConfigName }) => {
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
          'search-modal flex h-full max-h-screen min-h-96 max-w-screen min-w-96 resize flex-col gap-0 overflow-auto pt-0 pb-0',
        )}
        data-state={isClosing ? 'closed' : 'open'}
        style={{ width: dimensions.width || undefined, height: dimensions.height || undefined }}
      >
        <SearchProvider>
          <div onMouseDown={onMouseDown} className='cursor-move'>
            <SearchHeader
              onClose={handleClose}
              configNames={configNames}
              initialConfigName={initialConfigName}
            />
          </div>
          {configNames.length ? (
            <SearchContent initialQuery={initialQuery} />
          ) : (
            <div className='flex flex-1 items-center justify-center p-4'>
              <p className='text-center break-words text-muted-foreground'>
                No AI configurations found. Please add some configurations first.
              </p>
            </div>
          )}
        </SearchProvider>
      </Card>
    </div>
  )
}
