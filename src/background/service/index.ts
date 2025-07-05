import type OpenAI from 'openai'

import { AIMessage, DialogItem } from '@/lib/messaging/types'

import { HistoryClient } from '../clients/historyClient'
import { HistoryItem } from '../clients/historyClient/types'
import type { DialogResponse, MessageServiceConfig } from './types'

export class MessageService {
  private defaultModel: string
  private openaiClient: OpenAI
  private historyClient: HistoryClient
  private systemPrompt: string
  private maxTokens: number
  private temperature: number

  constructor({
    client,
    historyClient,
    defaultModel,
    systemPrompt,
    maxTokens,
    temperature,
  }: MessageServiceConfig) {
    this.openaiClient = client
    this.historyClient = historyClient
    this.defaultModel = defaultModel
    this.systemPrompt = systemPrompt
    this.maxTokens = maxTokens
    this.temperature = temperature
  }

  getHistory(dialogId: string): HistoryItem | undefined
  getHistory(dialogId: string, defaultHistory: HistoryItem): HistoryItem
  getHistory(dialogId: string, defaultHistory?: HistoryItem): HistoryItem | undefined {
    const history = this.historyClient.getHistory(dialogId)

    return history || defaultHistory
  }

  private addMessage(dialogId: string, message: AIMessage): void {
    const content = message.content
    const label = content.length < 20 ? content : `${content.slice(0, 20)}...`
    const defaultHistory = {
      dialog: {
        id: dialogId,
        label,
      },
      messages: [{ role: 'system', content: this.systemPrompt } as AIMessage],
    }
    const history = this.getHistory(dialogId, defaultHistory)

    history.messages.push(message)
    this.historyClient.updateHistory(history)
  }

  /**
   * Send a message to AI API and get a complete response (non-streaming)
   */
  async sendMessage(message: AIMessage, dialogId: string): Promise<DialogResponse> {
    this.addMessage(dialogId, message)
    // NOTE: after adding a message, history must always be available
    const history = this.getHistory(dialogId)
    if (!history) {
      throw new Error(`History not found for dialog ${dialogId}`)
    }
    const response = await this.openaiClient.chat.completions.create({
      model: this.defaultModel,
      messages: history.messages,
      stream: false,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
    })
    const content = response.choices[0]?.message?.content || ''

    this.addMessage(dialogId, { role: 'assistant', content })
    const updatedHistory = this.getHistory(dialogId)
    // NOTE: after adding a message, history must always be available
    if (!updatedHistory) {
      throw new Error(`History not found for dialog ${dialogId}`)
    }

    return {
      messages: updatedHistory.messages.slice(1), // Exclude system message
      dialog: updatedHistory.dialog,
    }
  }

  /**
   * Update service settings
   */
  updateSettings(
    config: Partial<Pick<MessageServiceConfig, 'systemPrompt' | 'maxTokens' | 'temperature'>>,
  ): void {
    this.systemPrompt = config.systemPrompt || this.systemPrompt
    this.maxTokens = config.maxTokens || this.maxTokens
    this.temperature = config.temperature || this.temperature
  }

  /**
   * Clear all conversation history
   */
  clearHistory(): void {
    this.historyClient.clearAllHistory()
  }

  /**
   * Get all dialogs
   */
  getDialogs(): DialogItem[] {
    return this.historyClient.getDialogs()
  }

  /**
   * Delete a dialog
   */
  deleteDialog(dialogId: string): void {
    this.historyClient.clearHistory(dialogId)
  }
}

let messageServiceInstance: MessageService | null = null

export function getMessageService(): MessageService
export function getMessageService({
  client,
  historyClient,
  defaultModel,
  systemPrompt,
  maxTokens,
  temperature,
}: MessageServiceConfig): MessageService

export function getMessageService(config?: MessageServiceConfig): MessageService {
  if (!messageServiceInstance) {
    if (!config) {
      throw new Error(
        'MessageService not initialized. Provide client, historyClient and defaultModel to initialize.',
      )
    }
    messageServiceInstance = new MessageService(config)
  }
  return messageServiceInstance
}

export function resetMessageService(): void {
  if (messageServiceInstance) {
    messageServiceInstance.clearHistory()
  }
  messageServiceInstance = null
}
