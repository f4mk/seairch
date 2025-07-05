import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

import { Spinner } from '@/components/Spinner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAutoScroll } from '@/hooks/useAutoScroll'

import { components } from '../TextContent/consts'
import { Props } from './types'

export const DialogContent: Props = ({ messages, isLoading }) => {
  const { scrollViewportRef, bottomRef } = useAutoScroll(messages)

  return (
    <div className='w-full overflow-auto flex-1'>
      <ScrollArea className='h-full w-full' ref={scrollViewportRef}>
        <div className='flex flex-col gap-4 p-4'>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {message.role === 'user' ? (
                  <div className='text-sm break-words'>{message.content}</div>
                ) : (
                  <div className='text-sm'>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={components}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className='flex justify-start gap-3'>
              <div className='max-w-[80%] rounded-lg p-3 bg-muted text-foreground'>
                <Spinner />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  )
}
