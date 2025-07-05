import { MESSAGE_TYPES, MSG_AI_STREAM_CHUNK } from '@/consts/messages'

export type MessageType = (typeof MESSAGE_TYPES)[number]

export type BaseMessage = {
  type: MessageType
  payload?: Record<string, unknown>
}

export type RequestMessage = BaseMessage & {
  payload: Record<string, unknown>
}

export type ResponseMessage = {
  success: boolean
  data?: unknown
  error?: string
}

export type StreamChunk = {
  type: 'chunk' | 'done' | 'error'
  content?: string
  error?: string
}

export type StreamMessage = BaseMessage & {
  type: typeof MSG_AI_STREAM_CHUNK
  payload: StreamChunk
}

export type MessageHandler<T = unknown> = (
  message: RequestMessage,
  sender: chrome.runtime.MessageSender,
) => Promise<T> | T

export type StreamHandler = (chunk: StreamChunk, sender: chrome.runtime.MessageSender) => void

export type AIMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}
export type DialogItem = {
  id: string
  label: string
}
