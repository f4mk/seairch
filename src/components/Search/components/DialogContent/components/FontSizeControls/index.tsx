import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { Props } from './types'

export const FontSizeControls: Props = ({ onIncrease, onDecrease, canIncrease, canDecrease }) => {
  return (
    <div className='absolute bottom-2 left-2 z-10 flex gap-1'>
      <Button
        variant='outline'
        size='sm'
        onClick={onDecrease}
        disabled={!canDecrease}
        className={cn(
          'h-8 w-8 border-border/50 bg-background/80 p-0 backdrop-blur-sm hover:bg-background/90',
          canDecrease && 'cursor-pointer',
        )}
      >
        <Minus className='h-4 w-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={onIncrease}
        disabled={!canIncrease}
        className={cn(
          'h-8 w-8 border-border/50 bg-background/80 p-0 backdrop-blur-sm hover:bg-background/90',
          canIncrease && 'cursor-pointer',
        )}
      >
        <Plus className='h-4 w-4' />
      </Button>
    </div>
  )
}
