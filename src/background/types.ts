import {
  MSG_DELETE_DIALOG,
  MSG_GET_DIALOGS,
  MSG_INITIALIZE_AI,
  MSG_RESET_AI,
  MSG_SEND_AI_MESSAGE,
  MSG_SEND_AI_MESSAGE_STREAM,
  MSG_UPDATE_AI,
} from '@/consts/messages'
import { AIMessage } from '@/lib/messaging/types'

export type AIMessageType =
  | typeof MSG_INITIALIZE_AI
  | typeof MSG_SEND_AI_MESSAGE
  | typeof MSG_SEND_AI_MESSAGE_STREAM
  | typeof MSG_RESET_AI
  | typeof MSG_UPDATE_AI

export type ContentMessage =
  | {
      type: Exclude<AIMessageType, typeof MSG_INITIALIZE_AI | typeof MSG_SEND_AI_MESSAGE>
      payload: Record<string, unknown>
    }
  | {
      type: typeof MSG_INITIALIZE_AI
      payload: InitConfig
    }
  | {
      type: typeof MSG_SEND_AI_MESSAGE
      payload: {
        message?: AIMessage
        dialogId: string
      }
    }
  | {
      type: typeof MSG_GET_DIALOGS
      payload: undefined
    }
  | {
      type: typeof MSG_DELETE_DIALOG
      payload: {
        dialogId: string
      }
    }

export type BackgroundResponse = {
  success: boolean
  data?: unknown
  error?: string
}
export type InitConfig = {
  apiKey: string
  baseUrl: string
  defaultModel: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  maxHistoryMessages?: number
}
