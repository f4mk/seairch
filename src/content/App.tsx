import { useEffect, useState } from 'react'

import { Search } from '../components/Search'

export const App = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+I (Mac) or Ctrl+I (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault()
        setShow((prev) => !prev)

        if (!show) {
          // Focus the search input when opening
          setTimeout(() => {
            const searchInput = document.getElementById('spotlight-search')
            searchInput?.focus()
          }, 100)
        }
      }

      // Close on Escape
      if (event.key === 'Escape' && show) {
        setShow(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [show])

  // Control pointer events on the host element
  useEffect(() => {
    const hostElement = document.querySelector('[style*="position: fixed"]') as HTMLElement
    if (hostElement) {
      hostElement.style.pointerEvents = show ? 'auto' : 'none'
    }
  }, [show])

  console.log('allo', show)

  return <>{show && <Search />}</>
}
