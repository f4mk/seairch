import { useCallback, useRef } from 'react'

import { Card } from '@/components/ui/card'
import { DEFAULT_ANIMATION_DURATION, Z_INDEX_MODAL } from '@/consts/styles'
import { HEIGHT_MIN, WIDTH_MIN } from '@/consts/visuals'
import { useDraggable } from '@/hooks/useDraggable'
import { useExitAnimation } from '@/hooks/useExitAnimation'
import { calculateModalPosition } from '@/lib/position'
import { cn } from '@/lib/utils'

import { SearchContent } from './components/SearchContent'
import { SearchHeader } from './components/SearchHeader'
import { THROTTLE_TIME } from './consts'
import { SearchProvider } from './context'
import { useCollapse, useLoadVisualSettings } from './hooks'
import { Props } from './types'

export const Search: Props = ({ initialQuery = '', configNames, initialConfigName, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const { dimensions, updateDimensions } = useLoadVisualSettings()
  const { isCollapsed, onCollapse } = useCollapse(updateDimensions)
  const { isClosing, handleClose } = useExitAnimation({ onClose })
  const { position, isDragging, onMouseDown } = useDraggable(modalRef, THROTTLE_TIME)

  const setModalRef = useCallback((element: HTMLDivElement | null) => {
    modalRef.current = element
  }, [])

  const handleCollapse = useCallback(() => {
    onCollapse(modalRef.current)
  }, [onCollapse])

  const calculatedPosition = calculateModalPosition(position, dimensions)

  return (
    <div
      ref={setModalRef}
      className='fixed focus:ring-0 focus:ring-offset-0 focus:outline-none'
      style={{
        left: calculatedPosition.x,
        top: calculatedPosition.y,
        zIndex: Z_INDEX_MODAL,
        userSelect: isDragging ? 'none' : 'auto',
      }}
      tabIndex={-1}
    >
      <Card
        className={cn(
          'search-modal flex flex-col gap-0 overflow-hidden pt-0 pb-0',
          isCollapsed
            ? `h-auto w-48 transition-all duration-${DEFAULT_ANIMATION_DURATION} ease-in-out`
            : 'h-full max-h-screen max-w-screen resize overflow-auto',
        )}
        data-state={isClosing ? 'closed' : 'open'}
        style={{
          width: isCollapsed ? undefined : dimensions.width,
          height: isCollapsed ? undefined : dimensions.height,
          minWidth: isCollapsed ? undefined : WIDTH_MIN,
          minHeight: isCollapsed ? undefined : HEIGHT_MIN,
        }}
      >
        <SearchProvider>
          <div onMouseDown={onMouseDown} className='cursor-move'>
            <SearchHeader
              onCollapse={handleCollapse}
              onClose={handleClose}
              configNames={configNames}
              initialConfigName={initialConfigName}
              isCollapsed={isCollapsed}
            />
          </div>
          <div className={cn('flex-1 overflow-hidden', isCollapsed ? 'hidden' : 'flex')}>
            {configNames.length ? (
              <SearchContent initialQuery={initialQuery} />
            ) : (
              <div className='flex flex-1 items-center justify-center p-4'>
                <p className='text-center text-base break-words text-muted-foreground'>
                  No AI configurations found. Please add some configurations first.
                </p>
              </div>
            )}
          </div>
        </SearchProvider>
      </Card>
    </div>
  )
}
