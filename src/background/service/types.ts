// AI Provider API types
export type AIMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type StreamChunk = {
  type: 'chunk' | 'done' | 'error'
  content?: string
  error?: string
}
