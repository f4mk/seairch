import { FC } from 'react'

import { AIMessage } from '@/lib/messaging/types'

export type Props = FC<{
  initialQuery: string
}>
export type SearchResult = {
  messages: AIMessage[]
  dialogId: string
}
