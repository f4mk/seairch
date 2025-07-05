import type { DialogItem } from '@/lib/messaging/types'

import { HistoryItem } from './types'

export const conversationHistory = new Map<string, HistoryItem>()

export const conversationTimeouts = new Map<string, NodeJS.Timeout>()

export type HistoryConfig = {
  maxHistoryMessages: number
}

export class HistoryClient {
  private maxHistoryMessages: number

  constructor(config: HistoryConfig) {
    this.maxHistoryMessages = config.maxHistoryMessages
  }

  /**
   * Get all dialogs
   */
  getDialogs(): DialogItem[] {
    return Array.from(conversationHistory.values()).map((history) => ({
      ...history.dialog,
    }))
  }

  /**
   * Add messages to conversation history
   */
  updateHistory(history: HistoryItem): void {
    conversationHistory.set(history.dialog.id, history)
    this.limitHistory(history.dialog.id, this.maxHistoryMessages)
  }

  /**
   * Get conversation history
   */

  getHistory(dialogId: string): HistoryItem | undefined {
    return conversationHistory.get(dialogId)
  }

  /**
   * Limit conversation history while preserving system prompt
   */
  private limitHistory(dialogId: string, maxMessages: number): void {
    const history = conversationHistory.get(dialogId)
    if (history && history.messages.length > maxMessages) {
      history.messages.splice(1, history.messages.length - maxMessages)
    }
  }

  /**
   * Clear conversation history for a specific dialog
   */
  clearHistory(dialogId: string): void {
    conversationHistory.delete(dialogId)
  }

  /**
   * Clear all conversation history and timeouts
   */
  clearAllHistory(): void {
    conversationHistory.clear()
  }
}
