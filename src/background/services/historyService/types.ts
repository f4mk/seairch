import type OpenAI from 'openai'

import { AIMessage, DialogItem } from '@/lib/messaging/types'

import { HistoryClient } from '../../clients/historyClient'

export type HistoryServiceConfig = {
  client: OpenAI
  historyClient: HistoryClient
  defaultModel: string
  systemPrompt: string
  maxTokens: number
  temperature: number
}

export type DialogResponse = {
  messages: AIMessage[]
  dialog: DialogItem
}
export type HistoryServiceExternalParams = Omit<HistoryServiceConfig, 'historyClient'> & {
  maxHistoryMessages: number
}
