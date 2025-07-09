import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DEFAULT_MAX_HISTORY_MESSAGES,
  MAX_MAX_HISTORY_MESSAGES,
  MIN_MAX_HISTORY_MESSAGES,
} from '@/consts/background'
import { initializeAI, resetAI } from '@/lib/messaging'
import { getAIConfig, setAIConfig } from '@/lib/storage/ai'
import { cn } from '@/lib/utils'

export const AIConfigurationForm = () => {
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState('')
  const [url, setUrl] = useState('')
  const [maxHistoryMessages, setMaxHistoryMessages] = useState(DEFAULT_MAX_HISTORY_MESSAGES)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getAIConfig()
        if (config.apiKey) setApiKey(config.apiKey)
        if (config.modelName) setModelName(config.modelName)
        if (config.baseUrl) setUrl(config.baseUrl)
        if (config.maxHistoryMessages) setMaxHistoryMessages(config.maxHistoryMessages)
      } catch (error) {
        console.error('Error loading AI config:', error)
      }
    }

    void loadConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      await initializeAI(apiKey, url, modelName, maxHistoryMessages)

      try {
        await setAIConfig({
          apiKey,
          modelName,
          baseUrl: url,
          maxHistoryMessages,
        })
      } catch (error) {
        console.error('Error saving AI config:', error)
      }

      setMessage('AI service initialized successfully!')
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Initialization error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    setMessage('')

    try {
      await resetAI()
      setMessage('AI service reset successfully!')
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Reset error:', error)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Card className='flex h-full w-full flex-col'>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col'>
        <form onSubmit={handleSubmit} className='flex flex-1 flex-col space-y-4'>
          <div className='w-full space-y-2'>
            <label htmlFor='apiKey' className='text-sm font-medium text-foreground'>
              API Key
            </label>
            <Input
              id='apiKey'
              type='password'
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder='Enter your API key'
              required
            />
          </div>
          <div className='w-full space-y-2'>
            <label htmlFor='modelName' className='text-sm font-medium text-foreground'>
              Model Name
            </label>
            <Input
              id='modelName'
              type='text'
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder='Enter model name'
              required
            />
          </div>
          <div className='w-full space-y-2'>
            <label htmlFor='url' className='text-sm font-medium text-foreground'>
              Base URL
            </label>
            <Input
              id='url'
              type='url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='Enter API base URL'
              required
            />
          </div>
          <div className='w-full space-y-2'>
            <label htmlFor='maxHistoryMessages' className='text-sm font-medium text-foreground'>
              Max History Messages
            </label>
            <Input
              id='maxHistoryMessages'
              type='number'
              value={maxHistoryMessages}
              onChange={(e) => setMaxHistoryMessages(parseInt(e.target.value, 10))}
              placeholder={String(DEFAULT_MAX_HISTORY_MESSAGES)}
              min={MIN_MAX_HISTORY_MESSAGES}
              max={MAX_MAX_HISTORY_MESSAGES}
            />
          </div>
          <Button type='submit' disabled={isLoading} className='w-full'>
            {isLoading ? 'Initializing...' : 'Initialize AI Service'}
          </Button>
          <Button
            type='button'
            variant='outline'
            disabled={isResetting}
            onClick={handleReset}
            className='w-full'
          >
            {isResetting ? 'Resetting...' : 'Reset AI Service'}
          </Button>
        </form>
        {message && (
          <div
            className={cn(
              'mt-4 rounded-md p-3 text-sm',
              message.includes('Error')
                ? 'border border-destructive/20 bg-destructive/15 text-destructive'
                : 'border border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-400',
            )}
          >
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
