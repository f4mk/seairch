import { FC } from 'react'

export type Props = FC<{
  searchQuery: string
  setSearchQuery: (value: string) => void
  handleSearch: () => Promise<void>
  isLoading?: boolean
}>
