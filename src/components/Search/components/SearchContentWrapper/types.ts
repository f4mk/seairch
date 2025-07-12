import { FC } from 'react'

import { AIMessage } from '@/lib/messaging/types'

export type Props = FC<{
  isLoading: boolean
  messages: AIMessage[]
  dialogId: string
  isStreaming: boolean
}>
