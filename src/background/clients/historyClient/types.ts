import type { AIMessage, DialogItem } from '@/lib/messaging/types'

export type HistoryItem = {
  dialog: DialogItem
  messages: AIMessage[]
}
