import { useContext } from 'react'

import { SearchContext } from './context'
import { StreamingContextType } from './types'

export const useStreamingContext = (): StreamingContextType => {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
}
