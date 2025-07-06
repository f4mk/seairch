import { useEffect, useRef, useState } from 'react'

import { DEFAULT_THRESHOLD, THROTTLE_MS } from './consts'
import { Props } from './types'

export const AutoScroll: Props = ({
  scrollContainerRef,
  scrollBehavior = 'smooth',
  threshold = DEFAULT_THRESHOLD,
  children,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)

  useEffect(() => {
    if (!scrollContainerRef?.current) {
      console.warn('No scroll container provided or available')
      return
    }

    const el = scrollContainerRef.current

    function onScroll() {
      const scrollFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      if (scrollFromBottom > threshold) {
        setAutoScrollEnabled(false)
      } else {
        setAutoScrollEnabled(true)
      }
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollContainerRef, threshold])

  useEffect(() => {
    if (!autoScrollEnabled || !wrapperRef.current) return

    const intervalId = window.setInterval(() => {
      wrapperRef.current?.scrollIntoView({ behavior: scrollBehavior })
    }, THROTTLE_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [autoScrollEnabled, scrollBehavior])

  return <div ref={wrapperRef}>{children}</div>
}
