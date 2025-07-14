import { MSG_AI_STREAM_CHUNK } from '@/consts/messages'

import { HistoryClient } from './clients/historyClient'
import { createOpenAIClient } from './clients/openaiClient'
import { OpenAIConfig } from './clients/openaiClient/types'
import { HistoryService } from './services/historyService'
import { HistoryServiceExternalParams } from './services/historyService/types'
import { MessageService } from './services/messageService'
import type { ContentMessage } from './types'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line
let keepAlivePort: chrome.runtime.Port | null = null

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'keepAlivePort') {
    keepAlivePort = port

    port.onMessage.addListener((msg) => {
      console.log(msg)
    })

    port.onDisconnect.addListener(() => {
      keepAlivePort = null
    })
  }
})

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
        type: MSG_AI_STREAM_CHUNK,
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
