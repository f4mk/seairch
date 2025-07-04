// Background script - handles messages from content scripts and forwards to AI API

import OpenAI from 'openai'

import { getAIService } from './service'
import type { AIMessage } from './service/types'
import type { BackgroundResponse, ContentMessage } from './types'

// API configuration constants (will be provided by popup later)
const _API_CONFIG = {
  API_KEY: 'your-api-key-here', // TODO: Get from popup
  BASE_URL: 'https://api.perplexity.ai', // TODO: Get from popup
  DEFAULT_MODEL: 'llama-3.1-sonar-small-128k-online', // TODO: Get from popup
}

// Initialize AI service
let aiService: ReturnType<typeof getAIService> | null = null

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message: ContentMessage, _sender, sendResponse) => {
  console.log('Background received message:', message)
  // Handle the message and send response
  handleMessage(message)
    .then(sendResponse)
    .catch((error) => {
      console.error('Error handling message:', error)
      sendResponse({
        success: false,
        error: error.message,
      })
    })

  return true // Keep message channel open for async response
})

// Handle incoming messages
async function handleMessage(message: ContentMessage): Promise<BackgroundResponse> {
  const { type, payload } = message

  try {
    switch (type) {
      case 'initialize_ai':
        return await handleInitializeAI(payload)

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

// Handle AI service initialization
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
    // Create OpenAI client and inject as dependency
    const client = new OpenAI({
      baseURL: baseUrl,
      apiKey,
      dangerouslyAllowBrowser: true,
    })

    // Initialize service with dependency injection
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

// Handle non-streaming AI message
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

// Handle streaming AI message
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

    // Start streaming (this will send chunks via chrome.runtime.sendMessage)
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
