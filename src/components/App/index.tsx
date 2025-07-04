import { useEffect, useRef, useState } from 'react'

import { ID_HOST } from '@/consts/styles'

import { Search } from '../Search'

export const App = () => {
  const [show, setShow] = useState(false)
  const hostRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    hostRef.current = document.getElementById(ID_HOST) as HTMLElement | null
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault()
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

  return <>{show && <Search onClose={() => setShow(false)} />}</>
}
