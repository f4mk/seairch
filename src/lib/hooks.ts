import { useEffect, useState } from 'react'

import { getAIConfig, listAIConfigs } from '@/lib/storage/ai'

import { initAIConfig } from './utils'

export const useAutoInitAI = () => {
  const [configNames, setConfigNames] = useState<string[]>([])

  useEffect(() => {
    const loadAndInit = async () => {
      try {
        const configNames = await listAIConfigs()
        if (!configNames) throw new Error('No AI configs found')
        setConfigNames(configNames)
        const config = await getAIConfig(configNames[0])
        if (config && Object.values(config).every(Boolean)) {
          await initAIConfig(config)
        }
      } catch (error) {
        console.error('Error loading AI config:', error)
      }
    }

    void loadAndInit()
  }, [])

  return { configNames }
}
