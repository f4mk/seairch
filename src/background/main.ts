import {
  MSG_GET_DIALOGS,
  MSG_INITIALIZE_AI,
  MSG_RESET_AI,
  MSG_SEND_AI_MESSAGE,
  MSG_UPDATE_AI,
} from '@/consts/messages'
import type { AIMessage } from '@/lib/messaging/types'

import { HistoryClient } from './clients/historyClient'
import { createOpenAIClient } from './clients/openaiClient'
import {
  DEFAULT_MAX_HISTORY_MESSAGES,
  DEFAULT_MAX_TOKENS,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_TEMPERATURE,
} from './consts'
import { getMessageService, resetMessageService } from './service'
import type { BackgroundResponse, ContentMessage, InitConfig } from './types'

let messageService: ReturnType<typeof getMessageService> | null = null
let historyClient: HistoryClient | null = null

chrome.runtime.onMessage.addListener((message: ContentMessage, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((error) => {
      console.error('Error handling message:', error)
      sendResponse({
        success: false,
        error: error.message,
      })
    })

  return true
})

async function handleMessage(message: ContentMessage): Promise<BackgroundResponse> {
  const { type, payload } = message

  try {
    switch (type) {
      case MSG_INITIALIZE_AI:
        return handleInitializeAI(payload)

      case MSG_RESET_AI:
        return handleResetAI()

      case MSG_UPDATE_AI:
        return handleUpdateAI(payload)

      case MSG_SEND_AI_MESSAGE:
        return handleSendAIMessage(payload)

      case MSG_GET_DIALOGS:
        return handleGetDialogs()

      default:
        return {
          success: false,
          error: `Unknown message type: ${type}`,
        }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function handleInitializeAI(payload: InitConfig): Promise<BackgroundResponse> {
  const { apiKey, baseUrl, defaultModel, systemPrompt, maxTokens, temperature } = payload

  if (!apiKey || !baseUrl || !defaultModel) {
    return {
      success: false,
      error: 'API key, base URL, and default model are required',
    }
  }

  try {
    const client = createOpenAIClient({ apiKey, baseUrl })
    historyClient = new HistoryClient({
      maxHistoryMessages: DEFAULT_MAX_HISTORY_MESSAGES,
    })
    messageService = getMessageService({
      client,
      historyClient,
      defaultModel,
      systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
      maxTokens: maxTokens || DEFAULT_MAX_TOKENS,
      temperature: temperature || DEFAULT_TEMPERATURE,
    })

    return {
      success: true,
      data: { message: 'AI service initialized successfully' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize service',
    }
  }
}

async function handleUpdateAI(payload: Record<string, unknown>): Promise<BackgroundResponse> {
  if (!messageService) {
    return {
      success: false,
      error: 'AI service not initialized. Please initialize the service first.',
    }
  }

  try {
    const systemPrompt = payload.systemPrompt as string
    const maxTokens = payload.maxTokens as number
    const temperature = payload.temperature as number

    messageService.updateSettings({
      systemPrompt,
      maxTokens,
      temperature,
    })

    return {
      success: true,
      data: { message: 'AI service updated successfully' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update service',
    }
  }
}

async function handleResetAI(): Promise<BackgroundResponse> {
  try {
    // Reset the service
    resetMessageService()
    messageService = null
    historyClient = null

    return {
      success: true,
      data: { message: 'AI service reset successfully' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset service',
    }
  }
}

async function handleSendAIMessage(payload: {
  messages: AIMessage[]
  dialogId: string
}): Promise<BackgroundResponse> {
  if (!messageService) {
    return {
      success: false,
      error: 'AI service not initialized. Please provide API configuration first.',
    }
  }

  try {
    if (!payload.messages || !Array.isArray(payload.messages)) {
      return {
        success: false,
        error: 'Messages array is required',
      }
    }

    if (!payload.dialogId) {
      return {
        success: false,
        error: 'Dialog ID is required',
      }
    }

    const result = await messageService.sendMessage(payload.messages, payload.dialogId)

    return {
      success: true,
      data: {
        messages: result.messages,
        dialogId: result.dialogId,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    }
  }
}

async function handleGetDialogs(): Promise<BackgroundResponse> {
  if (!historyClient) {
    return {
      success: false,
      error: 'History client not initialized. Please initialize the service first.',
    }
  }

  try {
    const dialogs = historyClient.getDialogs()
    return {
      success: true,
      data: {
        dialogs,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get dialogs',
    }
  }
}
