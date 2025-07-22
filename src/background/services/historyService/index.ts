import { AIMessage, DialogItem } from '@/lib/messaging/types'

import { HistoryClient } from '../../clients/historyClient'
import { HistoryItem } from '../../clients/historyClient/types'
import type { HistoryServiceConfig } from './types'

export class HistoryService {
  private historyClient: HistoryClient

  private constructor({ historyClient }: HistoryServiceConfig) {
    this.historyClient = historyClient
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
      messages: history.messages,
      dialog: history.dialog,
    }
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

  /**
   * Create a new dialog with the label set from the user's prompt
   */
  async createInitialDialog(dialogId: string, userText: string): Promise<void> {
    const label = this.makeLabel(userText)
    const history = {
      dialog: {
        id: dialogId,
        label,
      },
      messages: [],
    }
    await this.historyClient.updateHistory(history)
  }

  /**
   * Add a message to the history
   */
  async addMessage(dialogId: string, message: AIMessage): Promise<void> {
    const history = await this.getHistory(dialogId)
    if (!history) {
      throw new Error(`History not found for dialog ${dialogId}`)
    }
    history.messages.push(message)
    await this.historyClient.updateHistory(history)
  }

  /**
   * Get history for a dialog
   */
  async getHistory(dialogId: string): Promise<HistoryItem | undefined> {
    const history = await this.historyClient.getHistory(dialogId)
    return history
  }

  /**
   * Create a label for a message content (truncated if too long)
   */
  private makeLabel(content: string): string {
    return content.length < 30 ? content : `${content.slice(0, 28)}...`
  }
}
