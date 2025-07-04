import { ScrollArea } from '@/components/ui/scroll-area'

import { Props } from './types'

export const TextContent: Props = ({ text }) => {
  return (
    <div className='w-full overflow-auto flex-1'>
      <div className='overflow-y-auto h-full'>
        <div className='text-sm text-muted-foreground bg-muted/50 rounded-md p-3 break-words h-full w-full'>
          <ScrollArea className='h-full w-full'>{text}</ScrollArea>
        </div>
      </div>
    </div>
  )
}
