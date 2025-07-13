import { useEffect, useState } from 'react'

import { listAIConfigs } from '@/lib/storage/ai'

import { last, loadAndInitConfig } from './utils'

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
        await loadAndInitConfig(lastConfigName)
      } catch (error) {
        console.error('Error loading AI config:', error)
      }
    }

    void loadAndInit()
  }, [])

  return { configNames, selectedConfigName }
}
