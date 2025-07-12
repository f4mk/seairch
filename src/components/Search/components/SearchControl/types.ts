import { FC, RefObject } from 'react'

export type Props = FC<{
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  onSearch: () => void
  isLoading?: boolean
  ref?: RefObject<HTMLTextAreaElement | null>
}>
