// Types for background script communication (imported for future use)
// import { BackgroundResponse, ContentMessage } from '../types'

import type OpenAI from 'openai'

import { MSG_AI_STREAM_CHUNK } from '@/consts/messages'
import { sendToAllTabs, sendToPopup } from '@/lib/messaging'

import type { AIMessage, StreamChunk } from './types'

export class AIService {
  private defaultModel: string
  private client: OpenAI

  constructor(client: OpenAI, defaultModel: string) {
    this.client = client
    this.defaultModel = defaultModel
  }

  /**
   * Send a message to AI API and get a streaming response
   */
  async sendMessageStream(
    messages: AIMessage[],
    options: Record<string, unknown> = {},
  ): Promise<void> {
    try {
      const stream = await this.client.chat.completions.create({
        model: (options.model as string) || this.defaultModel,
        messages,
        stream: true,
        max_tokens: (options.max_tokens as number) || 1000,
        temperature: (options.temperature as number) || 0.7,
        ...options,
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          this.sendChunkToWindow({
            type: 'chunk',
            content,
          })
        }
      }

      // Send completion signal
      this.sendChunkToWindow({
        type: 'done',
      })
    } catch (error) {
      console.error('Error in sendMessageStream:', error)
      this.sendChunkToWindow({
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Send a message to AI API and get a complete response (non-streaming)
   */
  async sendMessage(messages: AIMessage[], options: Record<string, unknown> = {}): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: (options.model as string) || this.defaultModel,
        messages,
        stream: false,
        max_tokens: (options.max_tokens as number) || 1000,
        temperature: (options.temperature as number) || 0.7,
        ...options,
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('Error in sendMessage:', error)
      throw error
    }
  }

  /**
   * Send streaming chunk to extension window
   */
  private async sendChunkToWindow(chunk: StreamChunk): Promise<void> {
    // Send to popup if it exists
    await sendToPopup(MSG_AI_STREAM_CHUNK, chunk)
    // Send to all active tabs (content scripts)
    await sendToAllTabs(MSG_AI_STREAM_CHUNK, chunk)
  }
}

// Export a singleton instance
let aiServiceInstance: AIService | null = null

export function getAIService(client: OpenAI, defaultModel: string): AIService
export function getAIService(): AIService
export function getAIService(client?: OpenAI, defaultModel?: string): AIService {
  if (!aiServiceInstance) {
    if (!client || !defaultModel) {
      throw new Error('AIService not initialized. Provide client and defaultModel to initialize.')
    }
    aiServiceInstance = new AIService(client, defaultModel)
  }
  return aiServiceInstance
}
