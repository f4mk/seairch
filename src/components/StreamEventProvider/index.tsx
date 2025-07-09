import { useCallback, useEffect, useRef } from 'react'

import { MSG_AI_STREAM_CHUNK } from '@/consts/messages'
import { StreamMessage } from '@/lib/messaging/types'

import { StreamEventsContext, SubscribersMap } from './context'
import { Props, StreamCallbacks } from './types'

export const StreamEventsProvider: Props = ({ children }) => {
  const subscribers = useRef<SubscribersMap>(new Map())

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<StreamMessage>
      const message = customEvent.detail

      if (message.type !== MSG_AI_STREAM_CHUNK) return

      const { dialogId, chunk } = message.payload
      const callbacks = subscribers.current.get(dialogId)

      if (callbacks) {
        callbacks.onChunk(chunk)
      }
    }

    document.addEventListener(MSG_AI_STREAM_CHUNK, handler)

    return () => {
      document.removeEventListener(MSG_AI_STREAM_CHUNK, handler)
    }
  }, [])

  const subscribe = useCallback((dialogId: string, callbacks: StreamCallbacks) => {
    subscribers.current.set(dialogId, callbacks)

    return () => {
      subscribers.current.delete(dialogId)
    }
  }, [])

  return <StreamEventsContext.Provider value={subscribe}>{children}</StreamEventsContext.Provider>
}
