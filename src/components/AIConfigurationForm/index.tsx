import { useEffect, useState } from 'react'

import { Combobox } from '@/components/Combobox'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { STORAGE_KEYS } from '@/consts/ai'
import {
  DEFAULT_MAX_HISTORY_MESSAGES,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  MAX_MAX_HISTORY_MESSAGES,
  MAX_MAX_TOKENS,
  MAX_TEMPERATURE,
  MIN_MAX_HISTORY_MESSAGES,
  MIN_MAX_TOKENS,
  MIN_TEMPERATURE,
} from '@/consts/background'
import { resetAI } from '@/lib/messaging'
import { deleteAIConfig, getAIConfig, listAIConfigs, setAIConfig } from '@/lib/storage/ai'
import { AIConfig } from '@/lib/storage/types'
import { cn, initAIConfig } from '@/lib/utils'

import { defaultFormState } from './consts'

export const AIConfigurationForm = () => {
  const [formData, setFormData] = useState(defaultFormState)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [configOptions, setConfigOptions] = useState<{ id: string; label: string }[]>([])
  const [selectedOption, setSelectedOption] = useState<string>('')

  useEffect(() => {
    const loadConfigList = async () => {
      try {
        const configs = await listAIConfigs()
        if (configs && configs.length > 0) {
          const options = configs.map((config) => ({
            id: config,
            label: config,
          }))
          setConfigOptions(options)

          if (configs[0]) {
            const config = await getAIConfig(configs[0])
            if (config) {
              setFormData(config)
              setSelectedOption(configs[0])
            }
          }
        }
      } catch (error) {
        console.error('Error loading config list:', error)
      }
    }

    void loadConfigList()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    if (!formData[STORAGE_KEYS.name].trim()) {
      setMessage('Error: Configuration name is required')
      setIsLoading(false)
      return
    }

    if (
      selectedOption === 'new-config' &&
      configOptions.some((option) => option.id === formData[STORAGE_KEYS.name])
    ) {
      setMessage(`Error: Configuration name "${formData[STORAGE_KEYS.name]}" already exists`)
      setIsLoading(false)
      return
    }

    try {
      await initAIConfig(formData)

      try {
        await setAIConfig(formData[STORAGE_KEYS.name], formData)

        const updatedConfigs = await listAIConfigs()
        if (updatedConfigs) {
          const options = updatedConfigs.map((config) => ({
            id: config,
            label: config,
          }))
          setConfigOptions(options)
        }
        setSelectedOption(formData[STORAGE_KEYS.name])
      } catch (error) {
        console.error('Error saving AI config:', error)
      }

      setMessage(
        `AI configuration "${formData[STORAGE_KEYS.name]}" saved and initialized successfully!`,
      )
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Configuration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfigSelect = async (option: { id: string; label: string }) => {
    setSelectedOption(option.id)
    if (option.id === 'new-config') {
      setFormData(defaultFormState)
      setMessage('')
    } else {
      try {
        await resetAI()

        const config = await getAIConfig(option.id)
        if (config) {
          setFormData(config)

          void initAIConfig(config)
        }
      } catch (error) {
        console.error('Error loading AI config:', error)
      }
    }
  }

  const handleDeleteConfig = async () => {
    const configName = formData[STORAGE_KEYS.name]

    try {
      await deleteAIConfig(configName)

      setConfigOptions((prev) => prev.filter((option) => option.id !== configName))

      setFormData(defaultFormState)
      setSelectedOption('')
      setMessage(`Configuration "${configName}" deleted successfully`)
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Delete error:', error)
    }
  }

  const updateFormField = (field: keyof AIConfig, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className='flex h-full w-full flex-col'>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-1 flex-col'>
        <div className='mb-4'>
          <label className='mb-2 block text-sm font-medium text-foreground'>
            Select Configuration
          </label>
          <Combobox
            options={[
              ...configOptions,
              ...(configOptions.length > 0
                ? [{ id: 'new-config', label: '+ New Configuration' }]
                : []),
            ]}
            onChange={handleConfigSelect}
            placeholder='Select a configuration'
            emptyPlaceholder='No saved configurations'
            disabled={configOptions.length === 0}
            selectedKey={selectedOption}
          />
        </div>
        <form onSubmit={handleSubmit} className='flex flex-1 flex-col space-y-4'>
          <div className='w-full space-y-2'>
            <label htmlFor='name' className='text-sm font-medium text-foreground'>
              Configuration Name
            </label>
            <Input
              id='name'
              type='text'
              value={formData[STORAGE_KEYS.name]}
              onChange={(e) => updateFormField(STORAGE_KEYS.name, e.target.value)}
              placeholder='Enter a config name'
              required
            />
          </div>
          <div className='w-full space-y-2'>
            <label htmlFor='apiKey' className='text-sm font-medium text-foreground'>
              API Key
            </label>
            <Input
              id='apiKey'
              type='password'
              value={formData[STORAGE_KEYS.apiKey]}
              onChange={(e) => updateFormField(STORAGE_KEYS.apiKey, e.target.value)}
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
              value={formData[STORAGE_KEYS.modelName]}
              onChange={(e) => updateFormField(STORAGE_KEYS.modelName, e.target.value)}
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
              value={formData[STORAGE_KEYS.baseUrl]}
              onChange={(e) => updateFormField(STORAGE_KEYS.baseUrl, e.target.value)}
              placeholder='Enter API base URL'
              required
            />
          </div>
          <div className='w-full space-y-2'>
            <label htmlFor='systemPrompt' className='text-sm font-medium text-foreground'>
              System Prompt
            </label>
            <Textarea
              id='systemPrompt'
              value={formData[STORAGE_KEYS.systemPrompt]}
              onChange={(e) => updateFormField(STORAGE_KEYS.systemPrompt, e.target.value)}
              placeholder='Enter a system prompt to guide AI behavior...'
              className='max-h-32 min-h-20 resize-none overflow-y-auto break-words'
              rows={3}
            />
          </div>
          <div className='w-full space-y-2'>
            <label htmlFor='maxTokens' className='text-sm font-medium text-foreground'>
              Max Tokens
            </label>
            <Input
              id='maxTokens'
              type='number'
              value={formData[STORAGE_KEYS.maxTokens]}
              onChange={(e) =>
                updateFormField(STORAGE_KEYS.maxTokens, parseInt(e.target.value, 10))
              }
              placeholder={String(DEFAULT_MAX_TOKENS)}
              min={MIN_MAX_TOKENS}
              max={MAX_MAX_TOKENS}
            />
          </div>
          <div className='w-full space-y-2'>
            <label htmlFor='temperature' className='text-sm font-medium text-foreground'>
              Temperature
            </label>
            <Input
              id='temperature'
              type='number'
              value={formData[STORAGE_KEYS.temperature]}
              onChange={(e) =>
                updateFormField(STORAGE_KEYS.temperature, parseFloat(e.target.value))
              }
              placeholder={String(DEFAULT_TEMPERATURE)}
              min={MIN_TEMPERATURE}
              max={MAX_TEMPERATURE}
              step='0.1'
            />
          </div>
          <div className='w-full space-y-2'>
            <label htmlFor='maxHistoryMessages' className='text-sm font-medium text-foreground'>
              Max History Messages
            </label>
            <Input
              id='maxHistoryMessages'
              type='number'
              value={formData[STORAGE_KEYS.maxHistoryMessages]}
              onChange={(e) =>
                updateFormField(STORAGE_KEYS.maxHistoryMessages, parseInt(e.target.value, 10))
              }
              placeholder={String(DEFAULT_MAX_HISTORY_MESSAGES)}
              min={MIN_MAX_HISTORY_MESSAGES}
              max={MAX_MAX_HISTORY_MESSAGES}
            />
          </div>
          <div className='space-y-3'>
            <Button
              type='submit'
              disabled={
                isLoading ||
                Object.values(formData).some((value) => value === '' || value === undefined)
              }
              className='w-full'
            >
              {isLoading ? 'Configuring...' : 'Save & Initialize Configuration'}
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={handleDeleteConfig}
              className='w-full'
              disabled={!formData[STORAGE_KEYS.name] || formData[STORAGE_KEYS.name] === ''}
            >
              Delete Configuration
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
