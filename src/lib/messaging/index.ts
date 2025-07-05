import { useCallback, useEffect, useRef, useState } from 'react'

import {
  MSG_AI_STREAM_CHUNK,
  MSG_INITIALIZE_AI,
  MSG_SEND_AI_MESSAGE,
  MSG_SEND_AI_MESSAGE_STREAM,
} from '@/consts/messages'

import type {
  AIMessage,
  BaseMessage,
  MessageHandler,
  MessageType,
  RequestMessage,
  ResponseMessage,
  StreamChunk,
  StreamHandler,
  StreamMessage,
} from './types'

/**
 * Send a message to the background script and wait for a response
 * @param type - Message type
 * @param payload - Message payload
 * @returns Promise that resolves with the response
 */
export async function sendToBackground<T = unknown>(
  type: MessageType,
  payload: Record<string, unknown> = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type,
        payload,
      },
      (response: ResponseMessage) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else if (response?.success) {
          resolve(response.data as T)
        } else {
          reject(new Error(response?.error || 'Unknown error'))
        }
      },
    )
  })
}

/**
 * Send a message to a specific tab (content script)
 * @param tabId - Target tab ID
 * @param type - Message type
 * @param payload - Message payload
 * @returns Promise that resolves with the response
 */
export async function sendToTab<T = unknown>(
  tabId: number,
  type: MessageType,
  payload: Record<string, unknown> = {},
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      {
        type,
        payload,
      },
      (response: ResponseMessage) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else if (response?.success) {
          resolve(response.data as T)
        } else {
          reject(new Error(response?.error || 'Unknown error'))
        }
      },
    )
  })
}

/**
 * Send a message to all active tabs (content scripts)
 * @param type - Message type
 * @param payload - Message payload
 * @returns Promise that resolves when all messages are sent
 */
export async function sendToAllTabs(
  type: MessageType,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const tabs = await chrome.tabs.query({ active: true })

  const promises = tabs.map((tab) => {
    if (tab.id) {
      return sendToTab(tab.id, type, payload).catch(() => {})
    }
    return Promise.resolve()
  })

  await Promise.all(promises)
}

/**
 * Send a message to the popup (if open)
 * @param type - Message type
 * @param payload - Message payload
 * @returns Promise that resolves when message is sent (or popup is not open)
 */
export async function sendToPopup(
  type: MessageType,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    await chrome.runtime.sendMessage({
      type,
      payload,
    })
  } catch (error) {
    console.debug('Popup not open or message not handled:', error)
  }
}

/**
 * Set up a message listener for request-response pattern
 * @param type - Message type to listen for
 * @param handler - Function to handle the message
 */
export function onMessage(type: MessageType, handler: MessageHandler): () => void {
  const listener = async (
    message: RequestMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ResponseMessage) => void,
  ) => {
    if (message.type === type) {
      try {
        const result = await handler(message, sender)
        sendResponse({
          success: true,
          data: result,
        })
      } catch (error) {
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  chrome.runtime.onMessage.addListener(listener)

  return () => {
    chrome.runtime.onMessage.removeListener(listener)
  }
}

/**
 * Set up a listener for streaming messages (no response expected)
 * @param type - Message type to listen for
 * @param handler - Function to handle the stream chunk
 */
export function onStreamMessage(type: MessageType, handler: StreamHandler): () => void {
  const listener = (message: StreamMessage, sender: chrome.runtime.MessageSender) => {
    if (message.type === type && message.payload) {
      handler(message.payload as StreamChunk, sender)
    }
  }

  chrome.runtime.onMessage.addListener(listener)

  return () => {
    chrome.runtime.onMessage.removeListener(listener)
  }
}

/**
 * Set up a listener for all messages (useful for debugging)
 * @param handler - Function to handle all messages
 */
export function onAllMessages(
  handler: (message: BaseMessage, sender: chrome.runtime.MessageSender) => void,
): () => void {
  const listener = (message: BaseMessage, sender: chrome.runtime.MessageSender) => {
    handler(message, sender)
  }

  chrome.runtime.onMessage.addListener(listener)

  return () => {
    chrome.runtime.onMessage.removeListener(listener)
  }
}

/**
 * Initialize the AI service
 */
export async function initializeAI(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
): Promise<{ message: string }> {
  return sendToBackground(MSG_INITIALIZE_AI, {
    apiKey,
    baseUrl,
    defaultModel,
  })
}

/**
 * Send a message to AI and get a complete response
 */
export async function sendAIMessage(
  messages: AIMessage[],
  options: Record<string, unknown> = {},
): Promise<{ messages: AIMessage[]; dialogId: string }> {
  const { dialogId } = options
  return sendToBackground(MSG_SEND_AI_MESSAGE, {
    messages,
    dialogId,
  })
}

/**
 * Start streaming a message to AI
 */
export async function sendAIMessageStream(
  messages: AIMessage[],
  options: Record<string, unknown> = {},
): Promise<{ messages: AIMessage[] }> {
  return sendToBackground(MSG_SEND_AI_MESSAGE_STREAM, {
    messages,
    options,
  })
}

/**
 * Set up a listener for AI stream chunks
 */
export function onAIStreamChunk(handler: StreamHandler): () => void {
  return onStreamMessage(MSG_AI_STREAM_CHUNK, handler)
}

/**
 * React hook for setting up message listeners
 */
export function useMessageListener(type: MessageType, handler: MessageHandler): void {
  useEffect(() => {
    const cleanup = onMessage(type, handler)
    return cleanup
  }, [type, handler])
}

/**
 * React hook for setting up stream message listeners
 */
export function useStreamListener(type: MessageType, handler: StreamHandler): void {
  useEffect(() => {
    const cleanup = onStreamMessage(type, handler)
    return cleanup
  }, [type, handler])
}

/**
 * React hook for AI stream handling with state management
 */
export function useAIStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const [error, setError] = useState<string | null>(null)
  const currentRequestId = useRef<string | null>(null)

  const handleStreamChunk = useCallback((chunk: StreamChunk) => {
    switch (chunk.type) {
      case 'chunk':
        if (chunk.content) {
          setCurrentResponse((prev) => prev + chunk.content)
        }
        break
      case 'done':
        setIsStreaming(false)
        currentRequestId.current = null
        break
      case 'error':
        setError(chunk.error || 'Unknown error occurred')
        setIsStreaming(false)
        currentRequestId.current = null
        break
    }
  }, [])

  useStreamListener(MSG_AI_STREAM_CHUNK, handleStreamChunk)

  const sendStream = useCallback(
    async (messages: AIMessage[], options: Record<string, unknown> = {}) => {
      try {
        setError(null)
        setCurrentResponse('')
        setIsStreaming(true)

        await sendAIMessageStream(messages, options)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start streaming')
        setIsStreaming(false)
        currentRequestId.current = null
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setCurrentResponse('')
    setError(null)
    setIsStreaming(false)
    currentRequestId.current = null
  }, [])

  return {
    isStreaming,
    currentResponse,
    error,
    sendStream,
    reset,
  }
}
