import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { Combobox } from '@/components/Combobox'
import { Button } from '@/components/ui/button'
import { CardAction, CardHeader, CardTitle } from '@/components/ui/card'
import { resetAI } from '@/lib/messaging'
import { arrangeConfigNames, getAIConfig } from '@/lib/storage/ai'
import { initAIConfig } from '@/lib/utils'

import { useStreamingContext } from '../../hooks'
import { Props } from './types'

export const SearchHeader: Props = ({ configNames, initialConfigName, onClose }) => {
  const [configName, setConfigName] = useState(() => initialConfigName)
  const { isStreaming } = useStreamingContext()

  useEffect(() => {
    setConfigName(initialConfigName)
  }, [initialConfigName])

  const handleConfigChange = async (option: { id: string; label: string }) => {
    try {
      await resetAI()
      await arrangeConfigNames(option.id)
      setConfigName(option.id)

      const config = await getAIConfig(option.id)
      if (!config) return

      void initAIConfig(config)
    } catch (error) {
      console.error('Error resetting AI service:', error)
    }
  }

  return (
    <CardHeader className='items-center pt-4 pb-0'>
      <CardTitle className='flex gap-2 text-lg select-none'>
        Chat
        {!!configNames.length && (
          <div className='mx-auto'>
            <Combobox
              options={configNames.map((name) => ({
                id: name,
                label: name,
              }))}
              onChange={handleConfigChange}
              disabled={isStreaming}
              selectedKey={configName}
            />
          </div>
        )}
      </CardTitle>
      <CardAction>
        <Button variant='ghost' size='sm' aria-label='Close search' onClick={onClose}>
          <X size={24} />
        </Button>
      </CardAction>
    </CardHeader>
  )
}
