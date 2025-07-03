import { useCallback, useEffect, useState } from 'react'

export const useDraggable = (ref: React.RefObject<HTMLElement | null>) => {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        // Keep modal within viewport bounds
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
    [isDragging, dragOffset, ref],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return {
    position,
    isDragging,
    handleMouseDown,
  }
}
