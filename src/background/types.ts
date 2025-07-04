// Types for background script communication

import {
  MSG_INITIALIZE_AI,
  MSG_SEND_AI_MESSAGE,
  MSG_SEND_AI_MESSAGE_STREAM,
} from '@/consts/messages'

export type AIMessageType =
  | typeof MSG_INITIALIZE_AI
  | typeof MSG_SEND_AI_MESSAGE
  | typeof MSG_SEND_AI_MESSAGE_STREAM

export type ContentMessage = {
  type: AIMessageType
  payload: Record<string, unknown>
}

export type BackgroundResponse = {
  success: boolean
  data?: unknown
  error?: string
}
