import { useEffect, useLayoutEffect, useRef } from 'react'

import { DEFAULT_ANIMATION_DURATION } from '@/consts/styles'

import { UseAutoScrollOptions } from './types'

export const useAutoScroll = (newValue: unknown, options: UseAutoScrollOptions = {}) => {
  const { scrollBehavior = 'smooth' } = options

  const scrollViewportRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const previousItemsRef = useRef(newValue)

  useLayoutEffect(() => {
    const isNewValue = newValue !== previousItemsRef.current
    previousItemsRef.current = newValue
    let timeoutId: number
    if (isNewValue && bottomRef.current) {
      timeoutId = window.setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: scrollBehavior })
      }, DEFAULT_ANIMATION_DURATION)
    }
    return () => window.clearTimeout(timeoutId)
  }, [newValue, scrollBehavior])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: scrollBehavior })
    }
  }, [scrollBehavior])

  return {
    scrollViewportRef,
    bottomRef,
  }
}
