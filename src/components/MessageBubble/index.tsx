import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

import { components } from './consts'
import { Props } from './types'

export const MessageBubble: Props = ({ message }) => {
  const bubbleStyle = `max-w-[80%] rounded-lg p-3 ${
    message.role === 'user'
      ? 'bg-primary text-primary-foreground self-end'
      : 'bg-muted text-foreground self-start'
  }`

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={bubbleStyle}>
        {message.role === 'user' ? (
          <div className='break-words'>{message.content}</div>
        ) : (
          <div className='break-words break-all'>
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
  )
}
