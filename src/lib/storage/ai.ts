import { STORAGE_KEYS } from '@/consts/ai'

import { getMultipleStorageItems, setMultipleStorageItems } from './index'
import { AIConfig } from './types'

export const getAIConfig = async (): Promise<Partial<AIConfig>> => {
  return getMultipleStorageItems<Partial<AIConfig>>([
    STORAGE_KEYS.apiKey,
    STORAGE_KEYS.modelName,
    STORAGE_KEYS.baseUrl,
    STORAGE_KEYS.maxHistoryMessages,
  ])
}

export const setAIConfig = async (config: Partial<AIConfig>): Promise<void> => {
  const storageData: Record<string, unknown> = {}

  if (config.apiKey !== undefined) storageData[STORAGE_KEYS.apiKey] = config.apiKey
  if (config.modelName !== undefined) storageData[STORAGE_KEYS.modelName] = config.modelName
  if (config.baseUrl !== undefined) storageData[STORAGE_KEYS.baseUrl] = config.baseUrl
  if (config.maxHistoryMessages !== undefined)
    storageData[STORAGE_KEYS.maxHistoryMessages] = config.maxHistoryMessages

  return setMultipleStorageItems(storageData)
}
