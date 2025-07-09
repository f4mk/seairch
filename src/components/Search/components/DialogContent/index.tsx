import { AutoScroll } from '@/components/AutoScroll'
import { Spinner } from '@/components/Spinner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAutoScroll } from '@/hooks/useAutoScroll'

import { StaticDialogMessages } from './components/StaticDialogMessages'
import { StreamingDialogMessages } from './components/StreamingDialogMessages'
import { Props } from './types'

export const DialogContent: Props = ({ messages, isStreaming, currentDialogId }) => {
  const { scrollViewportRef, bottomRef } = useAutoScroll(currentDialogId)

  return (
    <div className='w-full flex-1 overflow-auto'>
      <ScrollArea className='h-full w-full' ref={scrollViewportRef}>
        <div className='flex flex-col gap-4 p-4'>
          <StaticDialogMessages messages={messages} />
          <StreamingDialogMessages dialogId={currentDialogId} />
        </div>
        {isStreaming && (
          <div className='flex justify-center'>
            <div className='max-w-[80%] rounded-lg p-3'>
              <AutoScroll scrollContainerRef={scrollViewportRef}>
                <Spinner />
              </AutoScroll>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  )
}
