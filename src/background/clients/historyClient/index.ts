import { type IDBPDatabase, openDB } from 'idb'

import type { DialogItem } from '@/lib/messaging/types'

import { DB_NAME, DB_VERSION, STORE_NAME } from './consts'
import type { HistoryConfig, HistoryDBSchema, HistoryItem } from './types'

let dbPromise: Promise<IDBPDatabase<HistoryDBSchema>> | null = null

const getDb = async (): Promise<IDBPDatabase<HistoryDBSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<HistoryDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'dialog.id' })
        }
      },
      blocked() {
        console.warn('Database upgrade was blocked')
      },
      blocking() {
        console.warn('Database is being blocked by another connection')
      },
    }).catch((error) => {
      console.error('Failed to open database:', error)
      dbPromise = null
      throw error
    })
  }
  return dbPromise
}

export class HistoryClient {
  private maxHistoryMessages: number

  private constructor(config: HistoryConfig) {
    this.maxHistoryMessages = config.maxHistoryMessages
  }

  /**
   * Create a new instance of HistoryClient
   */
  static create(config: HistoryConfig): HistoryClient {
    return new HistoryClient(config)
  }

  async getDialogs(): Promise<DialogItem[]> {
    try {
      const db = await getDb()
      const allItems = await db.getAll(STORE_NAME)
      return allItems.map((history) => ({ ...history.dialog }))
    } catch (error) {
      console.error('Failed to get dialogs:', error)
      throw new Error(
        `Failed to get dialogs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async updateHistory(history: HistoryItem): Promise<void> {
    try {
      const db = await getDb()

      this.limitHistory(history)
      await db.put(STORE_NAME, history)
    } catch (error) {
      console.error('Failed to update history:', error)
      throw new Error(
        `Failed to update history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async getHistory(dialogId: string): Promise<HistoryItem | undefined> {
    try {
      const db = await getDb()
      return db.get(STORE_NAME, dialogId)
    } catch (error) {
      console.error('Failed to get history:', error)
      throw new Error(
        `Failed to get history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async clearHistory(dialogId: string): Promise<void> {
    try {
      const db = await getDb()
      await db.delete(STORE_NAME, dialogId)
    } catch (error) {
      console.error('Failed to clear history:', error)
      throw new Error(
        `Failed to clear history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  async clearAllHistory(): Promise<void> {
    try {
      const db = await getDb()
      await db.clear(STORE_NAME)
    } catch (error) {
      console.error('Failed to clear all history:', error)
      throw new Error(
        `Failed to clear all history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  private limitHistory(history: HistoryItem): void {
    if (history.messages.length > this.maxHistoryMessages) {
      history.messages.splice(1, history.messages.length - this.maxHistoryMessages)
    }
  }
}
