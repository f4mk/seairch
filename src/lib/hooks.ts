import { useEffect, useState } from 'react'

import { listAIConfigs } from '@/lib/storage/ai'

import { last, loadAndInitConfig } from './utils'

export const useAutoInitAI = () => {
  const [configNames, setConfigNames] = useState<string[]>([])
  const [selectedConfigName, setSelectedConfigName] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [initPromise, setInitPromise] = useState<Promise<void> | null>(null)

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
        setIsInitialized(true)
      } catch (error) {
        console.error('Error loading AI config:', error)
        // NOTE Still set to true to avoid infinite loading
        setIsInitialized(true)
      }
    }

    const promise = loadAndInit()
    setInitPromise(promise)
  }, [])

  if (!isInitialized && initPromise) {
    throw initPromise
  }

  return { configNames, selectedConfigName }
}
