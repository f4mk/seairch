import { useEffect, useRef, useState, useTransition } from 'react'

import { MessageBubble } from '@/components/MessageBubble'
import { useStreamSubscription } from '@/components/StreamEventProvider/hooks'
import { AIMessage } from '@/lib/messaging/types'

import { Props } from './types'

export const StreamingDialogMessages: Props = ({ dialogId, isStreaming }) => {
  const { chunks, reset } = useStreamSubscription(dialogId)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [streamingContent, setStreamingContent] = useState('')
  const lastIndexRef = useRef(-1)

  const [_, startTransition] = useTransition()

  useEffect(() => {
    if (isStreaming) {
      reset()
      setStreamingContent('')
      lastIndexRef.current = -1
    }
  }, [isStreaming, reset])

  useEffect(() => {
    if (chunks.length <= lastIndexRef.current + 1) return

    let updatedStreamingContent = streamingContent
    const newMessages: AIMessage[] = []

    for (let i = lastIndexRef.current + 1; i < chunks.length; i++) {
      const chunk = chunks[i]

      if (chunk.role === 'user') {
        newMessages.push({ role: 'user', content: chunk.content })
      } else if (chunk.role === 'assistant') {
        if (chunk.isDone) {
          if (updatedStreamingContent.trim()) {
            newMessages.push({ role: 'assistant', content: updatedStreamingContent })
          }
          updatedStreamingContent = ''
        } else {
          updatedStreamingContent += chunk.content
        }
      }

      lastIndexRef.current = i
    }

    setMessages((prev) => [...prev, ...newMessages])

    startTransition(() => {
      setStreamingContent(updatedStreamingContent)
    })
  }, [chunks, streamingContent])

  return (
    <>
      {messages.map((message, index) => (
        <MessageBubble key={`live-${index}`} message={message} />
      ))}
      {isStreaming && streamingContent && (
        <MessageBubble message={{ role: 'assistant', content: streamingContent }} />
      )}
    </>
  )
}
