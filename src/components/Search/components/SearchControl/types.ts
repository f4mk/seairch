import { FC, RefObject } from 'react'

export type Props = FC<{
  searchQuery: string
  setSearchQuery: (value: string) => void
  handleSearch: () => void
  isLoading?: boolean
  ref?: RefObject<HTMLTextAreaElement | null>
}>
