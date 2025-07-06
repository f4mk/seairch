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
import { cn } from '@/lib/utils'

import { STORAGE_KEYS } from './consts'

export const AIConfigurationForm = () => {
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState('')
  const [url, setUrl] = useState('')
  const [maxHistoryMessages, setMaxHistoryMessages] = useState(DEFAULT_MAX_HISTORY_MESSAGES)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    try {
      chrome.storage.local.get(
        [
          STORAGE_KEYS.apiKey,
          STORAGE_KEYS.modelName,
          STORAGE_KEYS.baseUrl,
          STORAGE_KEYS.maxHistoryMessages,
        ],
        (res) => {
          if (res[STORAGE_KEYS.apiKey]) setApiKey(res[STORAGE_KEYS.apiKey])
          if (res[STORAGE_KEYS.modelName]) setModelName(res[STORAGE_KEYS.modelName])
          if (res[STORAGE_KEYS.baseUrl]) setUrl(res[STORAGE_KEYS.baseUrl])
          if (res[STORAGE_KEYS.maxHistoryMessages])
            setMaxHistoryMessages(res[STORAGE_KEYS.maxHistoryMessages])
        },
      )
    } catch (error) {
      console.error('Error accessing Chrome storage:', error)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      await initializeAI(apiKey, url, modelName, maxHistoryMessages)

      try {
        await chrome.storage.local.set({
          [STORAGE_KEYS.apiKey]: apiKey,
          [STORAGE_KEYS.modelName]: modelName,
          [STORAGE_KEYS.baseUrl]: url,
          [STORAGE_KEYS.maxHistoryMessages]: maxHistoryMessages,
        })
      } catch (error) {
        console.error('Error saving to Chrome storage:', error)
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
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
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
          <div className='space-y-2'>
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
          <div className='space-y-2'>
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
          <div className='space-y-2'>
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
                ? 'bg-destructive/15 text-destructive border border-destructive/20'
                : 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
            )}
          >
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
