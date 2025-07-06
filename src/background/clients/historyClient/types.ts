import { DBSchema } from 'idb'

import type { AIMessage, DialogItem } from '@/lib/messaging/types'

import { STORE_NAME } from './consts'

export type HistoryItem = {
  dialog: DialogItem
  messages: AIMessage[]
}
export type HistoryConfig = {
  maxHistoryMessages: number
}
export type HistoryDBSchema = DBSchema & {
  [STORE_NAME]: {
    key: string
    value: HistoryItem
  }
}
