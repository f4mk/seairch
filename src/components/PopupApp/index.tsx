import { AIConfigurationForm } from '@/components/AIConfigurationForm'
import { AISettingsForm } from '@/components/AISettingsForm'

export const PopupApp = () => {
  return (
    <div className='w-96 p-4 space-y-4'>
      <AIConfigurationForm />
      <AISettingsForm />
    </div>
  )
}
