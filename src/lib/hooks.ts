import { useEffect, useState } from 'react'

import { getAIConfig, listAIConfigs } from '@/lib/storage/ai'

import { initAIConfig, last } from './utils'

export const useAutoInitAI = () => {
  const [configNames, setConfigNames] = useState<string[]>([])
  const [selectedConfigName, setSelectedConfigName] = useState<string>('')

  useEffect(() => {
    const loadAndInit = async () => {
      try {
        const configNames = await listAIConfigs()

        if (!configNames) throw new Error('No AI configs found')
        setConfigNames(configNames)

        const lastConfigName = last(configNames)

        if (lastConfigName) {
          setSelectedConfigName(lastConfigName)
        }
        const config = await getAIConfig(lastConfigName)
        if (config && Object.values(config).every(Boolean)) {
          await initAIConfig(config)
        }
      } catch (error) {
        console.error('Error loading AI config:', error)
      }
    }

    void loadAndInit()
  }, [])

  return { configNames, selectedConfigName }
}
