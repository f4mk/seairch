import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CommandItem } from '@/components/ui/command'
import { cn } from '@/lib/utils'

import { Props } from './types'

export const Option: Props = ({ option, isSelected, onSelect, onButtonClick }) => {
  return (
    <CommandItem
      value={option.id}
      onSelect={() => onSelect(option)}
      className='flex cursor-pointer items-center justify-between'
    >
      <div className='flex min-w-0 flex-1 items-center gap-2'>
        <Check className={cn('h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
        <span className='truncate'>{option.label}</span>
      </div>
      <div className='flex h-6 w-6 shrink-0 items-center justify-center'>
        {option.iconButton ? (
          <Button
            variant='ghost'
            size='sm'
            onClick={(e) => {
              e.stopPropagation()
              onButtonClick?.(option)
            }}
            className='hover:bg-destructive/10 hover:text-destructive h-6 w-6 cursor-pointer p-0'
            aria-label={`Delete ${option.label}`}
          >
            {option.iconButton}
          </Button>
        ) : (
          <div className='h-6 w-6' />
        )}
      </div>
    </CommandItem>
  )
}
