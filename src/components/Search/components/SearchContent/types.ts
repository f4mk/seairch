import { FC } from 'react'

import { AIMessage, DialogItem } from '@/lib/messaging/types'

export type Props = FC<{
  initialQuery: string
}>
export type SearchResult = {
  messages: AIMessage[]
  dialog: DialogItem
}
export type StreamingResult = {
  dialog: DialogItem
}
export type UseRataArgs = {
  onSearchSuccess: (data: SearchResult) => void
  onSearchError: (error: Error) => void
  onStreamingSuccess: (data: StreamingResult) => void
  onStreamingError: (error: Error) => void
}
