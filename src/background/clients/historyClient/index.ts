import type { AIMessage, DialogItem } from '@/lib/messaging/types'

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
    return Array.from(conversationHistory.keys()).map((dialogId) => ({
      id: dialogId,
      label: dialogId,
    }))
  }

  /**
   * Add messages to conversation history
   */
  addMessages(dialogId: string, messages: AIMessage[]): HistoryItem {
    let historyItem = conversationHistory.get(dialogId)
    if (!historyItem) {
      historyItem = { messages: [], dialog: { id: dialogId, label: dialogId } }
      conversationHistory.set(dialogId, historyItem)
    }
    historyItem.messages.push(...messages)
    this.limitHistory(dialogId, this.maxHistoryMessages)
    return historyItem
  }

  /**
   * Limit conversation history while preserving system prompt
   */
  private limitHistory(dialogId: string, maxMessages: number): void {
    const history = conversationHistory.get(dialogId)
    if (history && history.messages.length > maxMessages) {
      const systemPrompt = history.messages[0]
      const recentMessages = history.messages.slice(-(maxMessages - 1))
      history.messages.splice(0, history.messages.length, systemPrompt, ...recentMessages)
    }
  }

  /**
   * Get conversation history
   */
  getHistory(dialogId: string): HistoryItem {
    return (
      conversationHistory.get(dialogId) || {
        messages: [],
        dialog: { id: dialogId, label: dialogId },
      }
    )
  }

  /**
   * Clear conversation history for a specific dialog
   */
  clearHistory(dialogId: string): void {
    conversationHistory.delete(dialogId)
    const timeout = conversationTimeouts.get(dialogId)
    if (timeout) {
      clearTimeout(timeout)
      conversationTimeouts.delete(dialogId)
    }
  }

  /**
   * Clear all conversation history and timeouts
   */
  clearAllHistory(): void {
    for (const timeout of conversationTimeouts.values()) {
      clearTimeout(timeout)
    }
    conversationHistory.clear()
    conversationTimeouts.clear()
  }
}
