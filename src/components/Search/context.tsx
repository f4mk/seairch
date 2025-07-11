import { createContext, ReactNode, useState } from 'react'

interface SearchContextType {
  isStreaming: boolean
  setIsStreaming: (streaming: boolean) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

interface SearchProviderProps {
  children: ReactNode
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [isStreaming, setIsStreaming] = useState(false)

  return (
    <SearchContext.Provider value={{ isStreaming, setIsStreaming }}>
      {children}
    </SearchContext.Provider>
  )
}

export { SearchContext }
