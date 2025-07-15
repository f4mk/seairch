import { FC } from 'react'

export type Props = FC<{
  initialQuery?: string
  configNames: string[]
  initialConfigName: string
  onClose: () => void
}>

export type StreamingContextType = {
  isStreaming: boolean
  setIsStreaming: (streaming: boolean) => void
}
