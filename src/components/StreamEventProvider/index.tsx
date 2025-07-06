import React, { createContext, useContext, useEffect, useRef } from 'react'

import { MSG_AI_STREAM_CHUNK } from '@/consts/messages'
import { StreamMessage } from '@/lib/messaging/types'

type StreamMessageCallback = (message: StreamMessage) => void

type SubscribersMap = Map<string, Set<StreamMessageCallback>>

const StreamEventsContext = createContext<{
  subscribe: (dialogId: string, callback: StreamMessageCallback) => () => void
} | null>(null)

export const StreamEventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const subscribers = useRef<SubscribersMap>(new Map())

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<StreamMessage>
      const message = customEvent.detail
      const dialogId = message.payload?.dialogId

      if (!dialogId) return

      const callbacks = subscribers.current.get(dialogId)
      if (callbacks) {
        callbacks.forEach((cb) => cb(message))
      }
    }

    document.addEventListener(MSG_AI_STREAM_CHUNK, handler)

    return () => {
      document.removeEventListener(MSG_AI_STREAM_CHUNK, handler)
    }
  }, [])

  const subscribe = (dialogId: string, callback: StreamMessageCallback) => {
    if (!subscribers.current.has(dialogId)) {
      subscribers.current.set(dialogId, new Set())
    }
    subscribers.current.get(dialogId)!.add(callback)

    return () => {
      subscribers.current.get(dialogId)?.delete(callback)
    }
  }

  return (
    <StreamEventsContext.Provider value={{ subscribe }}>{children}</StreamEventsContext.Provider>
  )
}

export const useStreamEvents = () => {
  const context = useContext(StreamEventsContext)
  if (!context) {
    throw new Error('useStreamEvents must be used within a StreamEventsProvider')
  }
  return context
}
