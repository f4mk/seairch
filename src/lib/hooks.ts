import { useEffect } from 'react'

import { STORAGE_KEYS } from '@/components/AIConfigurationForm/consts'
import { initializeAI } from '@/lib/messaging'

export const useAutoInitAI = () => {
  useEffect(() => {
    const initAI = async (args: {
      apiKey: string
      baseUrl: string
      modelName: string
      maxHistoryMessages: number
    }) => {
      await initializeAI(args.apiKey, args.baseUrl, args.modelName, args.maxHistoryMessages)
    }
    try {
      chrome.storage.local.get(
        [
          STORAGE_KEYS.apiKey,
          STORAGE_KEYS.modelName,
          STORAGE_KEYS.baseUrl,
          STORAGE_KEYS.maxHistoryMessages,
        ],
        async (res) => {
          await initAI({
            apiKey: res[STORAGE_KEYS.apiKey],
            baseUrl: res[STORAGE_KEYS.baseUrl],
            modelName: res[STORAGE_KEYS.modelName],
            maxHistoryMessages: Number(res[STORAGE_KEYS.maxHistoryMessages]),
          })
        },
      )
    } catch (error) {
      console.error('Error accessing Chrome storage:', error)
    }
  }, [])
}
