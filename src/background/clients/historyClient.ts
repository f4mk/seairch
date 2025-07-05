import type { AIMessage } from '@/lib/messaging/types'

export const conversationHistory = new Map<string, AIMessage[]>()

export const conversationTimeouts = new Map<string, NodeJS.Timeout>()

export type HistoryConfig = {
  timeoutMs: number
  maxHistoryMessages: number
}

export class HistoryClient {
  private timeoutMs: number
  private maxHistoryMessages: number

  constructor(config: HistoryConfig) {
    this.timeoutMs = config.timeoutMs
    this.maxHistoryMessages = config.maxHistoryMessages
  }

  /**
   * Get or initialize conversation history for a dialog
   */
  getConversationHistory(dialogId: string, systemPrompt: string): AIMessage[] {
    if (!conversationHistory.has(dialogId)) {
      conversationHistory.set(dialogId, [{ role: 'system', content: systemPrompt }])
    } else {
      const history = conversationHistory.get(dialogId)!
      if (history.length === 0 || history[0].role !== 'system') {
        history.unshift({ role: 'system', content: systemPrompt })
      } else {
        history[0].content = systemPrompt
      }
    }

    const existingTimeout = conversationTimeouts.get(dialogId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    const timeout = setTimeout(() => {
      conversationHistory.delete(dialogId)
      conversationTimeouts.delete(dialogId)
    }, this.timeoutMs)

    conversationTimeouts.set(dialogId, timeout)

    return conversationHistory.get(dialogId)!
  }

  /**
   * Add messages to conversation history
   */
  addMessages(dialogId: string, messages: AIMessage[]): AIMessage[] {
    let history = conversationHistory.get(dialogId)
    if (!history) {
      history = []
      conversationHistory.set(dialogId, history)
    }
    history.push(...messages)
    this.limitHistory(dialogId, this.maxHistoryMessages)
    return history
  }

  /**
   * Limit conversation history while preserving system prompt
   */
  private limitHistory(dialogId: string, maxMessages: number): void {
    const history = conversationHistory.get(dialogId)
    if (history && history.length > maxMessages) {
      const systemPrompt = history[0]
      const recentMessages = history.slice(-(maxMessages - 1))
      history.splice(0, history.length, systemPrompt, ...recentMessages)
    }
  }

  /**
   * Get conversation history without initializing
   */
  getHistory(dialogId: string): AIMessage[] {
    return conversationHistory.get(dialogId) || []
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
