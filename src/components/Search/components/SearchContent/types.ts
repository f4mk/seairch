import { FC } from 'react'

import { AIMessage, DialogItem } from '@/lib/messaging/types'

export type Props = FC<{
  initialQuery: string
  configNames: string[]
}>
export type SearchResult = {
  messages: AIMessage[]
  dialog: DialogItem
}
