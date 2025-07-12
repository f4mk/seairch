import { useEffect, useRef, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

import { SearchWrapper } from '@/components/SearchWrapper'
import { StreamEventsProvider } from '@/components/StreamEventProvider'
import { ID_HOST } from '@/consts/host'
import { KEY_ESCAPE } from '@/consts/keyboard'
import { useGlobalInputBlocker } from '@/hooks/useGlobalInputBlocker'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { matchesKeyboardShortcut } from '@/lib/keyboardShortcut'

import { KeyboardEventProvider } from '../KeyboardEventProvider'
import { queryClient } from './consts'
import { Props } from './types'

export const ContentApp: Props = ({ shadowRoot }) => {
  const [show, setShow] = useState(false)
  const hostRef = useRef<HTMLElement | null>(null)
  const { shortcut, isLoading } = useKeyboardShortcut()

  useGlobalInputBlocker(shadowRoot, shortcut)

  useEffect(() => {
    hostRef.current = document.getElementById(ID_HOST) as HTMLElement | null
  }, [])

  useEffect(() => {
    if (isLoading || !shortcut) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (matchesKeyboardShortcut(event, shortcut)) {
        event.preventDefault()
        setShow((prev) => !prev)
      }

      if (event.key === KEY_ESCAPE && show) {
        setShow(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [show, shortcut, isLoading])

  useEffect(() => {
    if (hostRef.current) {
      hostRef.current.style.pointerEvents = show ? 'auto' : 'none'
    }
  }, [show])

  return (
    <KeyboardEventProvider>
      <QueryClientProvider client={queryClient}>
        <StreamEventsProvider>
          {show && <SearchWrapper onClose={() => setShow(false)} />}
        </StreamEventsProvider>
      </QueryClientProvider>
    </KeyboardEventProvider>
  )
}
