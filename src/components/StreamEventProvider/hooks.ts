import { useCallback, useContext, useEffect, useState } from 'react'

import { ChunkMessage } from '@/lib/messaging/types'

import { StreamEventsContext } from './context'

export const useStreamEvents = () => {
  const context = useContext(StreamEventsContext)
  if (!context) {
    throw new Error('useStreamEvents must be used within a StreamEventsProvider')
  }
  return context
}

export const useStreamSubscription = (dialogId: string) => {
  const { subscribe } = useStreamEvents()
  const [chunks, setChunks] = useState<ChunkMessage[]>([])

  useEffect(() => {
    const unsubscribe = subscribe(dialogId, {
      onChunk: (chunk: string) => {
        try {
          const parsed = JSON.parse(chunk) as ChunkMessage
          if (
            parsed.role &&
            typeof parsed.content === 'string' &&
            typeof parsed.index === 'number'
          ) {
            setChunks((prev) => [...prev, parsed])
          }
        } catch (_e) {
          // Ignore invalid JSON chunks
        }
      },
    })

    return unsubscribe
  }, [dialogId, subscribe])

  const reset = useCallback(() => {
    setChunks([])
  }, [])

  return {
    chunks,
    reset,
  }
}
