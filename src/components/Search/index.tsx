import { useRef } from 'react'

import { Z_INDEX_MODAL } from '@/consts/styles'
import { useDraggable } from '@/hooks/useDraggable'

export const Search = () => {
  const modalRef = useRef<HTMLDivElement>(null)
  const { position, isDragging, handleMouseDown } = useDraggable(modalRef)

  return (
    <div
      ref={modalRef}
      className='fixed bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-[200px] h-[100px] overflow-hidden border border-gray-200 cursor-move'
      style={{
        left: position.x ?? '50%',
        top: position.y ?? '50%',
        transform: position.x !== null ? 'none' : 'translate(-50%, -50%)',
        zIndex: Z_INDEX_MODAL,
        userSelect: isDragging ? 'none' : 'auto',
      }}
      onMouseDown={handleMouseDown}
    >
      <div>Search</div>
    </div>
  )
}
