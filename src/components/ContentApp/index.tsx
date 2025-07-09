import { useEffect, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { Search } from '@/components/Search'
import { StreamEventsProvider } from '@/components/StreamEventProvider'
import { ID_HOST } from '@/consts/host'
import { KEY_ESCAPE } from '@/consts/keyboard'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'
import { useAutoInitAI } from '@/lib/hooks'
import { matchesKeyboardShortcut } from '@/lib/keyboardShortcut'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: 0,
      gcTime: 0,
    },
  },
})

export const ContentApp = () => {
  const [show, setShow] = useState(false)
  const [selectedText, setSelectedText] = useState<string | undefined>(undefined)
  const hostRef = useRef<HTMLElement | null>(null)
  const { shortcut, isLoading } = useKeyboardShortcut()

  useEffect(() => {
    hostRef.current = document.getElementById(ID_HOST) as HTMLElement | null
  }, [])

  useEffect(() => {
    if (isLoading || !shortcut) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (matchesKeyboardShortcut(event, shortcut)) {
        event.preventDefault()
        setSelectedText(window.getSelection()?.toString().trim())
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

  useAutoInitAI()

  return (
    <QueryClientProvider client={queryClient}>
      <StreamEventsProvider>
        {show && <Search onClose={() => setShow(false)} initialQuery={selectedText} />}
      </StreamEventsProvider>
    </QueryClientProvider>
  )
}
