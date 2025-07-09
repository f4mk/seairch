import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { Props } from './types'

export const Trigger: Props = ({ label, placeholder, disabled, open }) => {
  return (
    <PopoverTrigger asChild>
      <Button
        size='sm'
        variant='outline'
        role='combobox'
        aria-expanded={open}
        className={cn(
          'w-full justify-between',
          !label && 'text-muted-foreground',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        disabled={disabled}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <span className='truncate'>{label || placeholder}</span>
        <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
      </Button>
    </PopoverTrigger>
  )
}
