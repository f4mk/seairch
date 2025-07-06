import { useCallback, useState } from 'react'

import { Popover } from '@/components/ui/popover'

import { Content } from './components/Content'
import { Trigger } from './components/Trigger'
import { OptionType, Props } from './types'

export const Combobox: Props = ({
  options,
  onChange,
  onButtonClick,
  emptyPlaceholder = 'No options found',
  placeholder = 'New dialog',
  searchPlaceholder = 'Search...',
  disabled = false,
  onChangeState,
  selectedKey,
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

  const selectedOption = selectedKey
    ? options.find((option) => option.id === selectedKey)
    : options[0]

  return (
    <div className='relative z-10'>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <Trigger
          label={selectedOption?.label}
          placeholder={placeholder}
          disabled={disabled}
          open={open}
        />
        <Content
          searchPlaceholder={searchPlaceholder}
          emptyPlaceholder={emptyPlaceholder}
          options={options}
          selectedKey={selectedOption?.id}
          open={open}
          onSelect={handleSelect}
          onButtonClick={onButtonClick}
        />
      </Popover>
    </div>
  )
}
