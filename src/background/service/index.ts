import type OpenAI from 'openai'

import { AIMessage } from '@/lib/messaging/types'

import type { HistoryClient } from '../clients/historyClient'
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

  private generateDialogId(): string {
    return `dialog_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  private addMessages(dialogId: string, messages: AIMessage[]): AIMessage[] {
    const history = this.historyClient.getHistory(dialogId)
    if (!history.length) {
      return this.historyClient.addMessages(dialogId, [
        { role: 'system', content: this.systemPrompt },
        ...messages,
      ])
    }
    return this.historyClient.addMessages(dialogId, messages).slice(1)
  }

  /**
   * Send a message to AI API and get a complete response (non-streaming)
   */
  async sendMessage(messages: AIMessage[], dialogId?: string): Promise<DialogResponse> {
    const finalDialogId = dialogId || this.generateDialogId()

    const updatedHistory = this.addMessages(finalDialogId, messages)
    const response = await this.openaiClient.chat.completions.create({
      model: this.defaultModel,
      messages: updatedHistory,
      stream: false,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
    })
    const content = response.choices[0]?.message?.content || ''

    const result = this.addMessages(finalDialogId, [{ role: 'assistant', content }])
    return {
      messages: result,
      dialogId: finalDialogId,
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
