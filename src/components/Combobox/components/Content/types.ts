import { FC } from 'react'

import { OptionType } from '../../types'

export type Props = FC<{
  searchPlaceholder: string
  emptyPlaceholder: string
  options: OptionType[]
  selectedKey?: string
  onSelect: (option: OptionType) => void
  onButtonClick?: (option: OptionType) => void
  open: boolean
}>
