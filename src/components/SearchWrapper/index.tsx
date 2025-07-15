import { Suspense, useEffect, useState } from 'react'

import { Search } from '@/components/Search'
import { useAutoInitAI } from '@/hooks/useAutoInitAI'

import { ErrorBoundary } from './ErrorBoundary'
import { InnerProps, Props } from './types'

const SearchContent: InnerProps = ({ onClose }) => {
  const [selectedText, setSelectedText] = useState<string | undefined>()
  const { configNames, selectedConfigName } = useAutoInitAI()

  useEffect(() => {
    setSelectedText(window.getSelection()?.toString().trim())
  }, [])

  return (
    <Search
      onClose={onClose}
      initialQuery={selectedText}
      configNames={configNames}
      initialConfigName={selectedConfigName}
    />
  )
}

export const SearchWrapper: Props = ({ onClose }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <SearchContent onClose={onClose} />
      </Suspense>
    </ErrorBoundary>
  )
}
