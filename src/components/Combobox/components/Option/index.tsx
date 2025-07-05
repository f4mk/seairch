import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CommandItem } from '@/components/ui/command'
import { cn } from '@/lib/utils'

import { Props } from './types'

export const Option: Props = ({ option, isSelected, onSelect, onButtonClick }) => {
  return (
    <CommandItem
      key={option.id}
      value={option.label}
      onSelect={() => onSelect(option)}
      className='flex items-center justify-between cursor-pointer'
    >
      <div className='flex items-center gap-2 min-w-0 flex-1'>
        <Check className={cn('h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
        <span className='truncate'>{option.label}</span>
      </div>
      <div className='shrink-0 w-6 h-6 flex items-center justify-center'>
        {option.iconButton ? (
          <Button
            variant='ghost'
            size='sm'
            onClick={(e) => {
              e.stopPropagation()
              onButtonClick?.(option)
            }}
            className='h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive cursor-pointer'
            aria-label={`Delete ${option.label}`}
          >
            {option.iconButton}
          </Button>
        ) : (
          <div className='w-6 h-6' />
        )}
      </div>
    </CommandItem>
  )
}
