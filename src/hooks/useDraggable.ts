import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { throttle } from '@/lib/utils'

export const useDraggable = (ref: React.RefObject<HTMLElement | null>, throttleTime?: number) => {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const initialRectRef = useRef<DOMRect | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      initialRectRef.current = rect
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && initialRectRef.current) {
        const rect = initialRectRef.current
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        const maxX = window.innerWidth - rect.width
        const maxY = window.innerHeight - rect.height

        const clampedX = Math.max(0, Math.min(newX, maxX))
        const clampedY = Math.max(0, Math.min(newY, maxY))

        setPosition({
          x: clampedX,
          y: clampedY,
        })
      }
    },
    [isDragging, dragOffset],
  )

  const throttledMouseMove = useMemo(
    () => (throttleTime ? throttle(handleMouseMove, throttleTime) : handleMouseMove),
    [handleMouseMove, throttleTime],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    initialRectRef.current = null
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', throttledMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', throttledMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, throttledMouseMove, handleMouseUp])

  return {
    position,
    isDragging,
    handleMouseDown,
  }
}
