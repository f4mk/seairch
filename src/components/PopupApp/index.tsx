import { AIConfigurationForm } from '@/components/AIConfigurationForm'
import { AISettingsForm } from '@/components/AISettingsForm'
import { AppSettingsForm } from '@/components/AppSettingsForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const PopupApp = () => {
  return (
    <div className='relative h-screen w-96'>
      <div className='bg-card text-card-foreground flex h-full w-96 flex-col self-center rounded-xl border shadow-sm'>
        <Tabs defaultValue='ai-config' className='flex h-full flex-grow flex-col'>
          <TabsList className='bg-muted/50 flex items-center self-center rounded-t-xl border-b p-0'>
            <TabsTrigger
              value='ai-config'
              className='text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground flex-1 rounded-t-xl border-none bg-transparent py-3 transition-colors data-[state=active]:shadow-sm'
            >
              AI Config
            </TabsTrigger>
            <TabsTrigger
              value='ai-settings'
              className='text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground flex-1 rounded-t-xl border-none bg-transparent py-3 transition-colors data-[state=active]:shadow-sm'
            >
              AI Settings
            </TabsTrigger>
            <TabsTrigger
              value='content-app'
              className='text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground flex-1 rounded-t-xl border-none bg-transparent py-3 transition-colors data-[state=active]:shadow-sm'
            >
              Content App
            </TabsTrigger>
          </TabsList>
          <div className='h-full flex-grow p-6'>
            <TabsContent value='ai-config' className='mt-0 flex h-full flex-col items-start'>
              <AIConfigurationForm />
            </TabsContent>
            <TabsContent value='ai-settings' className='mt-0 flex h-full flex-col items-start'>
              <AISettingsForm />
            </TabsContent>
            <TabsContent value='content-app' className='mt-0 flex h-full flex-col items-start'>
              <AppSettingsForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
