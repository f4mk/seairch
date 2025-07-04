import OpenAI from 'openai'

import { getAIService, resetAIService } from './service'
import type { AIMessage } from './service/types'
import type { BackgroundResponse, ContentMessage } from './types'

let aiService: ReturnType<typeof getAIService> | null = null

chrome.runtime.onMessage.addListener((message: ContentMessage, _sender, sendResponse) => {
  console.log('Background received message:', message)
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
      case 'initialize_ai':
        return await handleInitializeAI(payload)

      case 'reset_ai':
        return await handleResetAI()

      case 'send_ai_message':
        return await handleSendAIMessage(payload)

      case 'send_ai_message_stream':
        return await handleSendAIMessageStream(payload)

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

async function handleInitializeAI(payload: Record<string, unknown>): Promise<BackgroundResponse> {
  const apiKey = payload.apiKey as string
  const baseUrl = payload.baseUrl as string
  const defaultModel = payload.defaultModel as string

  if (!apiKey || !baseUrl || !defaultModel) {
    return {
      success: false,
      error: 'API key, base URL, and default model are required',
    }
  }

  try {
    const client = new OpenAI({
      baseURL: baseUrl,
      apiKey,
      dangerouslyAllowBrowser: true,
    })

    aiService = getAIService(client, defaultModel)

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

async function handleResetAI(): Promise<BackgroundResponse> {
  try {
    // Reset the service
    resetAIService()
    aiService = null

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

async function handleSendAIMessage(payload: Record<string, unknown>): Promise<BackgroundResponse> {
  if (!aiService) {
    return {
      success: false,
      error: 'AI service not initialized. Please provide API configuration first.',
    }
  }

  try {
    const messages = payload.messages as AIMessage[]
    const options = (payload.options as Record<string, unknown>) || {}

    if (!messages || !Array.isArray(messages)) {
      return {
        success: false,
        error: 'Messages array is required',
      }
    }

    const response = await aiService.sendMessage(messages, options)

    return {
      success: true,
      data: { content: response },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    }
  }
}

async function handleSendAIMessageStream(
  payload: Record<string, unknown>,
): Promise<BackgroundResponse> {
  if (!aiService) {
    return {
      success: false,
      error: 'AI service not initialized. Please provide API configuration first.',
    }
  }

  try {
    const messages = payload.messages as AIMessage[]
    const options = (payload.options as Record<string, unknown>) || {}

    if (!messages || !Array.isArray(messages)) {
      return {
        success: false,
        error: 'Messages array is required',
      }
    }

    aiService.sendMessageStream(messages, options)

    return {
      success: true,
      data: { message: 'Streaming started' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start streaming',
    }
  }
}
