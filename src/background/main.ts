import {
  MSG_DELETE_DIALOG,
  MSG_GET_DIALOGS,
  MSG_INITIALIZE_AI,
  MSG_RESET_AI,
  MSG_SEND_AI_MESSAGE,
  MSG_UPDATE_AI,
} from '@/consts/messages'
import type { AIMessage } from '@/lib/messaging/types'
import { generateDialogId } from '@/lib/utils'

import { HistoryClient } from './clients/historyClient'
import { createOpenAIClient } from './clients/openaiClient'
import {
  DEFAULT_MAX_HISTORY_MESSAGES,
  DEFAULT_MAX_TOKENS,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_TEMPERATURE,
} from './consts'
import { getMessageService, MessageService, resetMessageService } from './service'
import type { BackgroundResponse, ContentMessage, InitConfig } from './types'

let messageService: MessageService | null = null
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

      case MSG_DELETE_DIALOG:
        return handleDeleteDialog(payload)

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
  message?: AIMessage
  dialogId: string
}): Promise<BackgroundResponse> {
  if (!messageService) {
    return {
      success: false,
      error: 'AI service not initialized. Please provide API configuration first.',
    }
  }

  try {
    if (!payload.dialogId) {
      payload.dialogId = generateDialogId()
    }

    if (!payload.message) {
      const history = messageService.getHistory(payload.dialogId)
      if (!history) {
        return {
          success: false,
          error: 'History not found',
        }
      }

      return {
        success: true,
        data: history,
      }
    }

    const result = await messageService.sendMessage(payload.message, payload.dialogId)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    }
  }
}

async function handleGetDialogs(): Promise<BackgroundResponse> {
  if (!messageService) {
    return {
      success: false,
      error: 'Message service not initialized. Please initialize the service first.',
    }
  }

  try {
    const dialogs = messageService.getDialogs()
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
async function handleDeleteDialog(payload: { dialogId: string }): Promise<BackgroundResponse> {
  if (!messageService) {
    return {
      success: false,
      error: 'Message service not initialized. Please initialize the service first.',
    }
  }

  try {
    messageService.deleteDialog(payload.dialogId)
    return {
      success: true,
      data: { message: 'Dialog deleted successfully' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete dialog',
    }
  }
}
