import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { UseAutoScrollOptions } from './types'

export const useAutoScroll = <T>(items: T[], options: UseAutoScrollOptions = {}) => {
  const { threshold = 50, scrollBehavior = 'smooth' } = options

  const scrollViewportRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const previousItemCountRef = useRef(items.length)
  const [userScrolledUp, setUserScrolledUp] = useState(false)

  useEffect(() => {
    const el = scrollViewportRef.current
    if (!el) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      setUserScrolledUp(distanceFromBottom > threshold)
    }

    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [threshold])

  useLayoutEffect(() => {
    const newItemAdded = items.length > previousItemCountRef.current
    previousItemCountRef.current = items.length

    if (!userScrolledUp && newItemAdded && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: scrollBehavior })
    }
  }, [items, userScrolledUp, scrollBehavior])

  return {
    scrollViewportRef,
    bottomRef,
    userScrolledUp,
  }
}
