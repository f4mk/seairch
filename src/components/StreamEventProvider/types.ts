import { FC, PropsWithChildren } from 'react'

export type StreamCallbacks = {
  onChunk: (chunk: string) => void
}

export type SubscribeFunction = (dialogId: string, callbacks: StreamCallbacks) => () => void

export type Props = FC<PropsWithChildren>
