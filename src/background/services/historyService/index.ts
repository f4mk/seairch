import type OpenAI from 'openai'

import { AIMessage, ChunkMessage, DialogItem } from '@/lib/messaging/types'

import { HistoryClient } from '../../clients/historyClient'
import { HistoryItem } from '../../clients/historyClient/types'
import type { DialogResponse, HistoryServiceConfig } from './types'

export class HistoryService {
  private defaultModel: string
  private openaiClient: OpenAI
  private historyClient: HistoryClient
  private systemPrompt: string
  private maxTokens: number
  private temperature: number

  private constructor({
    client,
    historyClient,
    defaultModel,
    systemPrompt,
    maxTokens,
    temperature,
  }: HistoryServiceConfig) {
    this.openaiClient = client
    this.historyClient = historyClient
    this.defaultModel = defaultModel
    this.systemPrompt = systemPrompt
    this.maxTokens = maxTokens
    this.temperature = temperature
  }

  /**
   * Create a new instance of HistoryService
   */
  static create(config: HistoryServiceConfig): HistoryService {
    return new HistoryService(config)
  }

  /**
   * Get the history for a dialog (excluding system message)
   */
  async getUserHistory(dialogId: string): Promise<HistoryItem> {
    const history = await this.getHistory(dialogId)
    if (!history) {
      throw new Error(`History not found for dialog ${dialogId}`)
    }
    return {
      // NOTE: Exclude system message
      messages: history.messages.slice(1),
      dialog: history.dialog,
    }
  }

  /**
   * Send a message to AI API and get a complete response
   */
  async sendMessage(
    message: AIMessage,
    dialogId: string,
    onChunk?: (chunk: string) => void,
  ): Promise<DialogResponse> {
    await this.addMessage(dialogId, message)

    const history = await this.getHistory(dialogId)
    if (!history) {
      throw new Error(`History not found for dialog ${dialogId}`)
    }

    const content = await this.streamResponse(history.messages, onChunk)
    await this.addMessage(dialogId, { role: 'assistant', content })

    const updatedHistory = await this.getHistory(dialogId)
    if (!updatedHistory) {
      throw new Error(`History not found for dialog ${dialogId}`)
    }
    return {
      // NOTE: Exclude system message
      messages: updatedHistory.messages.slice(1),
      dialog: updatedHistory.dialog,
    }
  }

  /**
   * Stream the AI response and collect the complete content
   */
  private async streamResponse(
    messages: AIMessage[],
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    const stream = await this.openaiClient.chat.completions.create({
      model: this.defaultModel,
      messages,
      stream: true,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
    })

    let content = ''
    let index = 0

    for await (const part of stream) {
      const chunk = part.choices[0]?.delta?.content
      if (chunk) {
        content += chunk
        onChunk?.(JSON.stringify(this.createChunkMessage(chunk, index)))
        index += 1
      }
    }

    onChunk?.(JSON.stringify(this.createChunkMessage('', index, true)))

    return content
  }

  /**
   * Create a chunk message for streaming
   */
  private createChunkMessage(content: string, index: number, isDone = false): ChunkMessage {
    return { role: 'assistant', content, index, isDone }
  }

  /**
   * Clear all conversation history
   */
  async clearHistory(): Promise<void> {
    await this.historyClient.clearAllHistory()
  }

  /**
   * Get all dialogs
   */
  async getDialogs(): Promise<DialogItem[]> {
    return this.historyClient.getDialogs()
  }

  /**
   * Delete a dialog
   */
  async deleteDialog(dialogId: string): Promise<void> {
    await this.historyClient.clearHistory(dialogId)
  }

  // --- Private Helpers ---

  private async getHistory(dialogId: string): Promise<HistoryItem | undefined>
  private async getHistory(dialogId: string, defaultHistory: HistoryItem): Promise<HistoryItem>
  private async getHistory(
    dialogId: string,
    defaultHistory?: HistoryItem,
  ): Promise<HistoryItem | undefined> {
    const history = await this.historyClient.getHistory(dialogId)
    return history || defaultHistory
  }

  /**
   * Add a message to the history
   */
  private async addMessage(dialogId: string, message: AIMessage): Promise<void> {
    const label = this.makeLabel(message.content)
    const defaultHistory = {
      dialog: {
        id: dialogId,
        label,
      },
      messages: [this.createSystemMessage()],
    }
    const history = await this.getHistory(dialogId, defaultHistory)

    history.messages.push(message)
    await this.historyClient.updateHistory(history)
  }

  /**
   * Create a label for a message content (truncated if too long)
   */
  private makeLabel(content: string): string {
    return content.length < 30 ? content : `${content.slice(0, 28)}...`
  }

  /**
   * Create a system message with the configured system prompt
   */
  private createSystemMessage(): AIMessage {
    return { role: 'system', content: this.systemPrompt }
  }
}
