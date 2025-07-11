import { useEffect, useState } from 'react'

import { Search } from '@/components/Search'
import { useAutoInitAI } from '@/lib/hooks'

import { Props } from './types'

export const SearchWrapper: Props = ({ onClose }) => {
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
