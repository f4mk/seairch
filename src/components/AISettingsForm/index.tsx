import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MSG_UPDATE_AI } from '@/consts/messages'
import { sendToBackground } from '@/lib/messaging'
import { cn } from '@/lib/utils'

export const AISettingsForm = () => {
  const [systemPrompt, setSystemPrompt] = useState('')
  const [maxTokens, setMaxTokens] = useState('1000')
  const [temperature, setTemperature] = useState('0.7')
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setMessage('')

    try {
      const updatePayload: Record<string, unknown> = {}

      if (systemPrompt.trim()) updatePayload.systemPrompt = systemPrompt.trim()
      if (maxTokens.trim() !== '1000') updatePayload.maxTokens = parseInt(maxTokens, 10)
      if (temperature.trim() !== '0.7') updatePayload.temperature = parseFloat(temperature)

      await sendToBackground(MSG_UPDATE_AI, updatePayload)

      setMessage('AI service updated successfully!')
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Update error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdate} className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='updateSystemPrompt' className='text-sm font-medium text-foreground'>
              System Prompt
            </label>
            <Textarea
              id='updateSystemPrompt'
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder='Enter a system prompt to guide AI behavior...'
              className='min-h-20 resize-none'
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
              placeholder='1000'
              min='1'
              max='4000'
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
              placeholder='0.7'
              min='0'
              max='2'
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
