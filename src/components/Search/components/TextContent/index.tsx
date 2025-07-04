import { ScrollArea } from '../../../ui/scroll-area'
import { Props } from './types'

export const TextContent: Props = ({ text }) => {
  return (
    <div className='pointer-events-auto h-full min-h-32 flex-1 overflow-auto'>
      <ScrollArea className='h-full'>
        <div className='text-sm text-muted-foreground bg-muted/50 rounded-md p-3'>{text}</div>
      </ScrollArea>
    </div>
  )
}
