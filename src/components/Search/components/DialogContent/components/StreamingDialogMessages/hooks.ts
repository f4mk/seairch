import { useEffect, useRef, useState, useTransition } from 'react'

import { useStreamSubscription } from '@/components/StreamEventProvider/hooks'
import { AIMessage } from '@/lib/messaging/types'

export const useStreamingMessages = (dialogId: string) => {
  const { chunks, reset } = useStreamSubscription(dialogId)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [streamingContent, setStreamingContent] = useState('')
  const lastIndexRef = useRef(-1)

  const [_, startTransition] = useTransition()

  useEffect(() => {
    if (chunks.length <= lastIndexRef.current + 1) return

    let updatedStreamingContent = streamingContent
    const newMessages: AIMessage[] = []
    let shouldReset = false

    for (let i = lastIndexRef.current + 1; i < chunks.length; i++) {
      const chunk = chunks[i]

      if (chunk.role === 'user') {
        setMessages((prev) => [...prev, { role: 'user', content: chunk.content }])
      } else if (chunk.role === 'assistant') {
        if (chunk.isDone) {
          if (updatedStreamingContent.trim()) {
            newMessages.push({ role: 'assistant', content: updatedStreamingContent })
          }
          shouldReset = true
        } else {
          updatedStreamingContent += chunk.content
        }
      }

      lastIndexRef.current = i
    }

    startTransition(() => {
      setStreamingContent(updatedStreamingContent)
    })

    if (shouldReset) {
      setMessages((prev) => [...prev, ...newMessages])
      setStreamingContent('')
      updatedStreamingContent = ''
      lastIndexRef.current = -1
      reset()
    }
  }, [chunks, streamingContent, reset])

  return {
    messages,
    streamingContent,
  }
}
