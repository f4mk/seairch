import { MESSAGE_TYPES, MSG_AI_STREAM_CHUNK } from '@/consts/messages'

export type MessageType = (typeof MESSAGE_TYPES)[number]

export type ResponseMessage = {
  success: boolean
  data?: unknown
  error?: string
}

export type StreamMessage = {
  type: typeof MSG_AI_STREAM_CHUNK
  payload: {
    dialogId: string
    chunk: string
  }
}

export type ChunkMessage = {
  role: 'user' | 'assistant'
  content: string
  index: number
  isDone?: boolean
}

export type AIMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}
export type DialogItem = {
  id: string
  label: string
}
