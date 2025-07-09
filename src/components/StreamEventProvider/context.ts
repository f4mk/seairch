import React from 'react'

type StreamChunkCallback = (chunk: string) => void

type StreamCallbacks = {
  onChunk: StreamChunkCallback
}

export type SubscribersMap = Map<string, StreamCallbacks>

export const StreamEventsContext = React.createContext<
  ((dialogId: string, callbacks: StreamCallbacks) => () => void) | null
>(null)
