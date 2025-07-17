import { MessageBubble } from '@/components/MessageBubble'

import { useStreamingMessages } from './hooks'
import { Props } from './types'

export const StreamingDialogMessages: Props = ({ dialogId }) => {
  const { messages, streamingContent } = useStreamingMessages(dialogId)

  return (
    <>
      {messages.map((message, index) => (
        <MessageBubble key={`live-${index}`} message={message} />
      ))}
      {streamingContent && (
        <MessageBubble message={{ role: 'assistant', content: streamingContent }} />
      )}
    </>
  )
}
