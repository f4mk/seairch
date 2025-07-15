import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { REGEX_KEYBOARD_SHORTCUT, STORAGE_KEYS } from '@/consts/keyboard'
import {
  FONT_SIZE_DEFAULT,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  HEIGHT_DEFAULT,
  HEIGHT_MAX,
  HEIGHT_MIN,
  WIDTH_DEFAULT,
  WIDTH_MAX,
  WIDTH_MIN,
} from '@/consts/visuals'
import {
  getKeyboardShortcut,
  setKeyboardShortcut as saveKeyboardShortcut,
} from '@/lib/storage/keyboard'
import { VisualSettingsForm } from '@/lib/storage/types'
import { getVisualSettings, saveVisualSettings } from '@/lib/storage/visual'
import { cn } from '@/lib/utils'

import { AppSettingsFormData, defaultFormState } from './consts'
import { validateAndFixFormData } from './utils'

export const AppSettingsForm = () => {
  const [formData, setFormData] = useState<AppSettingsFormData>(defaultFormState)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [savedShortcut, savedVisualSettings] = await Promise.all([
          getKeyboardShortcut(),
          getVisualSettings(),
        ])

        const newFormData = { ...defaultFormState }

        if (savedShortcut) {
          newFormData[STORAGE_KEYS.keyboardShortcut] = savedShortcut
        }
        if (savedVisualSettings) {
          newFormData[STORAGE_KEYS.baseFontSize] = savedVisualSettings[STORAGE_KEYS.baseFontSize]
          newFormData[STORAGE_KEYS.baseWidth] = savedVisualSettings[STORAGE_KEYS.baseWidth]
          newFormData[STORAGE_KEYS.baseHeight] = savedVisualSettings[STORAGE_KEYS.baseHeight]
        }
        setFormData(newFormData)
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    void loadSettings()
  }, [])

  const updateFormField = <K extends keyof AppSettingsFormData>(
    field: K,
    value: AppSettingsFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleShortcutChange = (value: string) => {
    if (value.length === 1 && REGEX_KEYBOARD_SHORTCUT.test(value)) {
      updateFormField(STORAGE_KEYS.keyboardShortcut, value.toUpperCase())
    } else if (value.length === 0) {
      updateFormField(STORAGE_KEYS.keyboardShortcut, '')
    }
  }

  const handleFieldBlur = (field: keyof AppSettingsFormData, value: string) => {
    const updatedFormData = { ...formData, [field]: value }
    const validatedFormData = validateAndFixFormData(updatedFormData)
    setFormData(validatedFormData)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setMessage('')

    try {
      const validatedFormData = validateAndFixFormData(formData)
      setFormData(validatedFormData)

      await Promise.all([
        saveKeyboardShortcut(validatedFormData[STORAGE_KEYS.keyboardShortcut] as string),
        saveVisualSettings(validatedFormData as VisualSettingsForm),
      ])

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
      setFormData(defaultFormState)

      await Promise.all([
        saveKeyboardShortcut(defaultFormState[STORAGE_KEYS.keyboardShortcut] as string),
        saveVisualSettings(defaultFormState as VisualSettingsForm),
      ])

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
              value={formData[STORAGE_KEYS.keyboardShortcut]}
              onChange={(e) => handleShortcutChange(e.target.value)}
              placeholder='Type a letter (A-Z)'
              className='font-mono'
              maxLength={1}
            />
            <p className='text-xs text-muted-foreground'>
              Type a single letter to set the keyboard shortcut (Cmd/Ctrl + letter)
            </p>
          </div>

          <div className='space-y-2'>
            <label htmlFor='baseFontSize' className='foreground text-sm font-medium'>
              Base Font Size
            </label>
            <Input
              id='baseFontSize'
              type='number'
              value={formData[STORAGE_KEYS.baseFontSize]}
              onChange={(e) =>
                updateFormField(STORAGE_KEYS.baseFontSize, parseInt(e.target.value, 10))
              }
              onBlur={(e) => handleFieldBlur(STORAGE_KEYS.baseFontSize, e.target.value)}
              placeholder={String(FONT_SIZE_DEFAULT)}
              min={FONT_SIZE_MIN}
              max={FONT_SIZE_MAX}
            />
            <p className='text-xs text-muted-foreground'>
              Base font size in pixels ({FONT_SIZE_MIN}-{FONT_SIZE_MAX})
            </p>
          </div>

          <div className='space-y-2'>
            <label htmlFor='baseWidth' className='foreground text-sm font-medium'>
              Base Width
            </label>
            <Input
              id='baseWidth'
              type='number'
              value={formData[STORAGE_KEYS.baseWidth]}
              onChange={(e) =>
                updateFormField(STORAGE_KEYS.baseWidth, parseInt(e.target.value, 10))
              }
              onBlur={(e) => handleFieldBlur(STORAGE_KEYS.baseWidth, e.target.value)}
              placeholder={String(WIDTH_DEFAULT)}
              min={WIDTH_MIN}
              max={WIDTH_MAX}
            />
            <p className='text-xs text-muted-foreground'>
              Base width in pixels ({WIDTH_MIN}-{WIDTH_MAX})
            </p>
          </div>

          <div className='space-y-2'>
            <label htmlFor='baseHeight' className='foreground text-sm font-medium'>
              Base Height
            </label>
            <Input
              id='baseHeight'
              type='number'
              value={formData[STORAGE_KEYS.baseHeight]}
              onChange={(e) =>
                updateFormField(STORAGE_KEYS.baseHeight, parseInt(e.target.value, 10))
              }
              onBlur={(e) => handleFieldBlur(STORAGE_KEYS.baseHeight, e.target.value)}
              placeholder={String(HEIGHT_DEFAULT)}
              min={HEIGHT_MIN}
              max={HEIGHT_MAX}
            />
            <p className='text-xs text-muted-foreground'>
              Base height in pixels ({HEIGHT_MIN}-{HEIGHT_MAX})
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
