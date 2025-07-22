import { useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react'

import { Combobox } from '@/components/Combobox'
import { Button } from '@/components/ui/button'
import { CardAction, CardHeader, CardTitle } from '@/components/ui/card'
import { resetAI } from '@/lib/messaging'
import { arrangeConfigNames, getAIConfig } from '@/lib/storage/ai'
import { initAIConfig } from '@/lib/utils'

import { useStreamingContext } from '../../hooks'
import { Props } from './types'

export const SearchHeader: Props = ({
  configNames,
  initialConfigName,
  isCollapsed,
  onClose,
  onCollapse,
}) => {
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
    <CardHeader className='items-center gap-0 pt-4 pb-4'>
      <CardTitle className='flex gap-0 text-lg select-none'>
        Chat
        {!!configNames.length && !isCollapsed && (
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
        <Button
          variant='ghost'
          size='sm'
          aria-label='Collapse search'
          onClick={onCollapse}
          className='cursor-pointer'
        >
          {isCollapsed ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
        </Button>
        <Button
          variant='ghost'
          size='sm'
          aria-label='Close search'
          onClick={onClose}
          className='cursor-pointer'
        >
          <X size={24} />
        </Button>
      </CardAction>
    </CardHeader>
  )
}
