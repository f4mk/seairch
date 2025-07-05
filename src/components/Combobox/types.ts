import { FC } from 'react'

export type OptionType = {
  id: string
  label: string
  iconButton?: React.ReactElement
}

export type Props = FC<{
  options: OptionType[]
  value: OptionType | null
  onChange: (option: OptionType) => void
  onButtonClick?: (option: OptionType) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyPlaceholder?: string
  disabled?: boolean
  onChangeState?: (isOpened: boolean) => void
}>
