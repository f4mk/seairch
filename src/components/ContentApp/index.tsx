import { useEffect, useRef, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ID_HOST } from '@/consts/styles'

import { Search } from '../Search'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
})

export const ContentApp = () => {
  const [show, setShow] = useState(false)
  const [selectedText, setSelectedText] = useState<string | undefined>(undefined)
  const hostRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    hostRef.current = document.getElementById(ID_HOST) as HTMLElement | null
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault()
        setSelectedText(window.getSelection()?.toString().trim())
        setShow((prev) => !prev)
      }

      if (event.key === 'Escape' && show) {
        setShow(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [show])

  useEffect(() => {
    if (hostRef.current) {
      hostRef.current.style.pointerEvents = show ? 'auto' : 'none'
    }
  }, [show])

  return (
    <QueryClientProvider client={queryClient}>
      {show && <Search onClose={() => setShow(false)} initialQuery={selectedText} />}
    </QueryClientProvider>
  )
}
