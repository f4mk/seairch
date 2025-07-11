import { useContext } from 'react'

import { SearchContext } from './context'

interface SearchContextType {
  isStreaming: boolean
  setIsStreaming: (streaming: boolean) => void
}

export const useSearchContext = (): SearchContextType => {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
}
