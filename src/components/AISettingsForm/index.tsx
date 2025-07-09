import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DEFAULT_MAX_TOKENS,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_TEMPERATURE,
  MAX_MAX_TOKENS,
  MAX_TEMPERATURE,
  MIN_MAX_TOKENS,
  MIN_TEMPERATURE,
} from '@/consts/background'
import { updateAI } from '@/lib/messaging'
import { cn } from '@/lib/utils'

export const AISettingsForm = () => {
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [maxTokens, setMaxTokens] = useState(String(DEFAULT_MAX_TOKENS))
  const [temperature, setTemperature] = useState(String(DEFAULT_TEMPERATURE))
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setMessage('')

    try {
      const updatePayload: Record<string, unknown> = {}

      if (systemPrompt.trim() !== DEFAULT_SYSTEM_PROMPT)
        updatePayload.systemPrompt = systemPrompt.trim()
      if (parseInt(maxTokens, 10) !== DEFAULT_MAX_TOKENS)
        updatePayload.maxTokens = parseInt(maxTokens, 10)
      if (parseFloat(temperature) !== DEFAULT_TEMPERATURE)
        updatePayload.temperature = parseFloat(temperature)

      await updateAI(updatePayload)

      setMessage('AI service updated successfully!')
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Update error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className='flex h-full w-full flex-col'>
      <CardHeader>
        <CardTitle>AI Settings</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col'>
        <form onSubmit={handleUpdate} className='flex flex-1 flex-col space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='updateSystemPrompt' className='text-sm font-medium text-foreground'>
              System Prompt
            </label>
            <Textarea
              id='updateSystemPrompt'
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder='Enter a system prompt to guide AI behavior...'
              className='max-h-32 min-h-20 resize-none overflow-y-auto break-words'
              rows={3}
            />
          </div>
          <div className='space-y-2'>
            <label htmlFor='maxTokens' className='text-sm font-medium text-foreground'>
              Max Tokens
            </label>
            <Input
              id='maxTokens'
              type='number'
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              placeholder={String(DEFAULT_MAX_TOKENS)}
              min={MIN_MAX_TOKENS}
              max={MAX_MAX_TOKENS}
            />
          </div>
          <div className='space-y-2'>
            <label htmlFor='temperature' className='text-sm font-medium text-foreground'>
              Temperature
            </label>
            <Input
              id='temperature'
              type='number'
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder={String(DEFAULT_TEMPERATURE)}
              min={MIN_TEMPERATURE}
              max={MAX_TEMPERATURE}
              step='0.1'
            />
          </div>
          <Button type='submit' variant='secondary' disabled={isUpdating} className='w-full'>
            {isUpdating ? 'Updating...' : 'Update AI Settings'}
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
