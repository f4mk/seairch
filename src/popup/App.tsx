import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MSG_INITIALIZE_AI, MSG_RESET_AI } from '@/consts/messages'
import { sendToBackground } from '@/lib/messaging'
import { cn } from '@/lib/utils'

export const App = () => {
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState('deepseek-chat')
  const [url, setUrl] = useState('https://api.deepseek.com/v1')
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await sendToBackground(MSG_INITIALIZE_AI, {
        apiKey,
        baseUrl: url,
        defaultModel: modelName,
      })

      setMessage('AI service initialized successfully!')
      console.log('Initialization response:', response)
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
      const response = await sendToBackground(MSG_RESET_AI, {})

      setMessage('AI service reset successfully!')
      console.log('Reset response:', response)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Reset error:', error)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className='w-96 p-4'>
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
    </div>
  )
}
