import { FC } from 'react'

export type Props = FC<{
  onClose: () => void
  initialQuery?: string
  configNames: string[]
  initialConfigName: string
}>

export type StreamingContextType = {
  isStreaming: boolean
  setIsStreaming: (streaming: boolean) => void
}
