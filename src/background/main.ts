import { MSG_AI_STREAM_CHUNK } from '@/consts/messages'

import type { ContentMessage } from './types'
import { createMessageService } from './utils'

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

const messageService = createMessageService()

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
