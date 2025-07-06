import { HistoryClient } from './clients/historyClient'
import { createOpenAIClient, OpenAIConfig } from './clients/openaiClient'
import { HistoryService } from './services/historyService'
import { HistoryServiceExternalParams } from './services/historyService/types'
import { MessageService } from './services/messageService'
import type { ContentMessage } from './types'

const messageService = new MessageService({
  createHistoryService: (params: HistoryServiceExternalParams) =>
    HistoryService.create({
      ...params,
      historyClient: HistoryClient.create({ maxHistoryMessages: params.maxHistoryMessages }),
    }),
  createOpenAIClient: (config: OpenAIConfig) => createOpenAIClient(config),
})

chrome.runtime.onMessage.addListener((message: ContentMessage, sender, sendResponse) => {
  const createChannel = (dialogId: string) => (chunk: string) => {
    if (sender.tab?.id != null) {
      void chrome.tabs.sendMessage(sender.tab.id, {
        type: 'AI_STREAM_CHUNK',
        payload: { dialogId, chunk },
      })
    }
  }

  messageService
    .handleMessage(message, createChannel)
    .then(sendResponse)
    .catch((error: Error) => {
      console.error('Error handling message:', error)
      sendResponse({
        success: false,
        error: error.message,
      })
    })

  return true
})
