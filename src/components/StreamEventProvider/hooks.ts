import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { BATCH_INTERVAL } from '@/lib/messaging/consts'
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
  const subscribe = useStreamEvents()
  const [chunks, setChunks] = useState<ChunkMessage[]>([])
  const bufferRef = useRef<ChunkMessage[]>([])
  const lastProcessedIndexRef = useRef(-1)
  const needsSortingRef = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (bufferRef.current.length > 0) {
        const chunksToProcess = bufferRef.current

        if (needsSortingRef.current) {
          chunksToProcess.sort((a, b) => a.index - b.index)
          needsSortingRef.current = false
        }

        setChunks((prev) => [...prev, ...chunksToProcess])
        lastProcessedIndexRef.current = Math.max(...chunksToProcess.map((chunk) => chunk.index))
        bufferRef.current = []
      }
    }, BATCH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

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
            if (parsed.index !== lastProcessedIndexRef.current + 1) {
              needsSortingRef.current = true
            }
            bufferRef.current.push(parsed)
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
    bufferRef.current = []
    lastProcessedIndexRef.current = -1
    needsSortingRef.current = false
  }, [])

  return {
    chunks,
    reset,
  }
}
