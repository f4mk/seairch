import { FC } from 'react'

import { OptionType } from '../../types'

export type Props = FC<{
  option: OptionType
  isSelected: boolean
  onSelect: (option: OptionType) => void
  onButtonClick?: (option: OptionType) => void
}>
