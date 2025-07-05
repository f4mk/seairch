import { useCallback, useState } from 'react'

import { Popover } from '@/components/ui/popover'

import { Content } from './components/Content'
import { Trigger } from './components/Trigger'
import { OptionType, Props } from './types'

export const Combobox: Props = ({
  options,
  value,
  onChange,
  onButtonClick,
  emptyPlaceholder = 'No options found',
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  disabled = false,
  onChangeState,
}) => {
  const [open, setOpen] = useState(false)

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen)
      onChangeState?.(isOpen)
    },
    [onChangeState],
  )

  const handleSelect = useCallback(
    (option: OptionType) => {
      onChange(option)
      setOpen(false)
    },
    [onChange],
  )

  return (
    <div className='relative z-10'>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <Trigger value={value} placeholder={placeholder} disabled={disabled} open={open} />
        <Content
          searchPlaceholder={searchPlaceholder}
          emptyPlaceholder={emptyPlaceholder}
          options={options}
          value={value}
          open={open}
          onSelect={handleSelect}
          onButtonClick={onButtonClick}
        />
      </Popover>
    </div>
  )
}
