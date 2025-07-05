import { FC } from 'react'

import { OptionType } from '../../types'

export type Props = FC<{
  value: OptionType | null
  placeholder: string
  disabled: boolean
  open: boolean
}>
