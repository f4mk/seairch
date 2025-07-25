import { useCallback, useEffect, useMemo, useState } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import { Command, CommandEmpty, CommandInput, CommandList } from '@/components/ui/command'
import { DEFAULT_ANIMATION_DURATION } from '@/consts/styles'

import { OptionType } from '../../types'
import { Option } from '../Option'
import { Props } from './types'

export const Content: Props = ({
  searchPlaceholder,
  emptyPlaceholder,
  selectedKey,
  options,
  onButtonClick,
  onSelect,
  open,
}) => {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) {
      const timeoutId = setTimeout(() => {
        setQuery('')
      }, DEFAULT_ANIMATION_DURATION)

      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [open])

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options
    return options.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()))
  }, [options, query])

  const handleSelect = useCallback(
    (option: OptionType) => {
      onSelect(option)
      setQuery('')
    },
    [onSelect],
  )

  return (
    <PopoverPrimitive.Content
      align='start'
      side='bottom'
      sideOffset={4}
      collisionPadding={8}
      avoidCollisions
      className='popover-content'
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder={searchPlaceholder}
          value={query}
          onValueChange={setQuery}
          className='border-0 focus:ring-0'
        />
        <CommandList className='max-h-[200px]'>
          <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
          {filteredOptions.map((option) => (
            <Option
              key={option.id}
              option={option}
              isSelected={selectedKey === option.id}
              onSelect={handleSelect}
              onButtonClick={onButtonClick}
            />
          ))}
        </CommandList>
      </Command>
    </PopoverPrimitive.Content>
  )
}
