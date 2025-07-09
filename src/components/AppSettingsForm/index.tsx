import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DEFAULT_KEYBOARD_SHORTCUT, REGEX_KEYBOARD_SHORTCUT } from '@/consts/keyboard'
import {
  getKeyboardShortcut,
  setKeyboardShortcut as saveKeyboardShortcut,
} from '@/lib/storage/keyboard'
import { cn } from '@/lib/utils'

export const AppSettingsForm = () => {
  const [keyboardShortcut, setKeyboardShortcut] = useState(DEFAULT_KEYBOARD_SHORTCUT)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadShortcut = async () => {
      try {
        const savedShortcut = await getKeyboardShortcut()
        if (savedShortcut) {
          setKeyboardShortcut(savedShortcut)
        }
      } catch (error) {
        console.error('Error loading keyboard shortcut:', error)
      }
    }

    void loadShortcut()
  }, [])

  const handleShortcutChange = (value: string) => {
    if (value.length === 1 && REGEX_KEYBOARD_SHORTCUT.test(value)) {
      setKeyboardShortcut(value.toUpperCase())
    } else if (value.length === 0) {
      setKeyboardShortcut('')
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setMessage('')

    try {
      await saveKeyboardShortcut(keyboardShortcut)

      setMessage('Content app settings updated successfully!')
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Update error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReset = async () => {
    setIsUpdating(true)
    setMessage('')

    try {
      setKeyboardShortcut(DEFAULT_KEYBOARD_SHORTCUT)
      await saveKeyboardShortcut(DEFAULT_KEYBOARD_SHORTCUT)

      setMessage('Content app settings reset to default!')
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Reset error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className='flex h-full w-full flex-col'>
      <CardHeader>
        <CardTitle>Content App Settings</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col'>
        <form onSubmit={handleUpdate} className='flex flex-1 flex-col space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='keyboardShortcut' className='foreground text-sm font-medium'>
              Keyboard Shortcut
            </label>
            <Input
              id='keyboardShortcut'
              type='text'
              value={keyboardShortcut}
              onChange={(e) => handleShortcutChange(e.target.value)}
              placeholder='Type a letter (A-Z)'
              className='font-mono'
              maxLength={1}
            />
            <p className='text-muted-foreground text-xs'>
              Type a single letter to set the keyboard shortcut (Cmd/Ctrl + letter)
            </p>
          </div>
          <div className='flex space-x-2'>
            <Button type='submit' disabled={isUpdating} className='flex-1'>
              {isUpdating ? 'Updating...' : 'Update Settings'}
            </Button>
            <Button
              type='button'
              variant='outline'
              disabled={isUpdating}
              onClick={handleReset}
              className='flex-1'
            >
              {isUpdating ? 'Resetting...' : 'Reset to Default'}
            </Button>
          </div>
        </form>
        {message && (
          <div
            className={cn(
              'mt-4 rounded-md p-3 text-sm',
              message.includes('Error')
                ? 'bg-destructive/15 text-destructive border-destructive/20 border'
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
