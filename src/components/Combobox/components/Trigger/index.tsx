import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { Props } from './types'

export const Trigger: Props = ({ value, placeholder, disabled, open }) => {
  return (
    <PopoverTrigger asChild>
      <Button
        variant='outline'
        role='combobox'
        aria-expanded={open}
        className={cn(
          'w-full justify-between',
          !value && 'text-muted-foreground',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        disabled={disabled}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span className='truncate'>{value?.label || placeholder}</span>
        <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
      </Button>
    </PopoverTrigger>
  )
}
