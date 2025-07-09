import { useEffect } from 'react'

import { initializeAI } from '@/lib/messaging'
import { getAIConfig } from '@/lib/storage/ai'

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
    const loadAndInit = async () => {
      try {
        const config = await getAIConfig()
        if (config.apiKey && config.baseUrl && config.modelName && config.maxHistoryMessages) {
          await initAI({
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
            modelName: config.modelName,
            maxHistoryMessages: config.maxHistoryMessages,
          })
        }
      } catch (error) {
        console.error('Error loading AI config:', error)
      }
    }

    void loadAndInit()
  }, [])
}
