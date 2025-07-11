import { CONFIG_LIST_KEY } from '@/consts/ai'

import { getStorageItem, setStorageItem } from './index'
import { AIConfig } from './types'

export const getAIConfig = async (name: string): Promise<AIConfig | null> => {
  return getStorageItem<AIConfig>(name)
}

export const setAIConfig = async (name: string, config: AIConfig): Promise<void> => {
  await setStorageItem(name, config)

  await arrangeConfigNames(name)
}

export const arrangeConfigNames = async (name: string): Promise<void> => {
  let configList = (await listAIConfigs()) || []
  configList = configList.filter((configName) => configName !== name)
  configList.push(name)
  await setStorageItem(CONFIG_LIST_KEY, configList)
}

export const listAIConfigs = async (): Promise<string[] | null> => {
  return getStorageItem<string[]>(CONFIG_LIST_KEY)
}

export const deleteAIConfig = async (name: string): Promise<void> => {
  await setStorageItem(name, null)

  const configList = await listAIConfigs()
  if (configList) {
    const updatedList = configList.filter((configName) => configName !== name)
    await setStorageItem(CONFIG_LIST_KEY, updatedList)
  }
}
