import { AIConfigurationForm } from '@/components/AIConfigurationForm'
import { AppSettingsForm } from '@/components/AppSettingsForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const PopupApp = () => {
  return (
    <div className='flex h-full min-h-screen w-96 flex-col'>
      <div className='flex h-full w-96 flex-1 flex-col self-center overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm'>
        <Tabs defaultValue='ai-config' className='flex h-full flex-grow flex-col'>
          <TabsList className='flex items-center self-center rounded-t-xl border-b bg-muted/50 p-0'>
            <TabsTrigger
              value='ai-config'
              className='flex-1 rounded-t-xl border-none bg-transparent py-3 text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
            >
              AI Config
            </TabsTrigger>
            <TabsTrigger
              value='content-app'
              className='flex-1 rounded-t-xl border-none bg-transparent py-3 text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
            >
              Content App
            </TabsTrigger>
          </TabsList>
          <div className='h-full flex-grow overflow-auto p-6'>
            <TabsContent value='ai-config' className='mt-0 flex flex-col items-start'>
              <AIConfigurationForm />
            </TabsContent>
            <TabsContent value='content-app' className='mt-0 flex flex-col items-start'>
              <AppSettingsForm />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
