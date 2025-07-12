import {
  MSG_AI_STREAM_CHUNK,
  MSG_DELETE_DIALOG,
  MSG_FETCH_AI_MESSAGE,
  MSG_GET_DIALOGS,
  MSG_INITIALIZE_AI,
  MSG_RESET_AI,
  MSG_SEARCH_AI_MESSAGE_STREAM,
} from '@/consts/messages'

import type { AIMessage, DialogItem, MessageType, ResponseMessage, StreamMessage } from './types'

/**
 * Send a message to the background script and wait for a response
 * @param type - Message type
 * @param payload - Message payload
 * @returns Promise that resolves with the response
 */
const sendToBackground = async <T = unknown>(
  type: MessageType,
  payload: Record<string, unknown> = {},
): Promise<T> => {
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
 * Initialize the AI service
 */
export const initializeAI = async (
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
  maxHistoryMessages: number,
  systemPrompt: string,
  maxTokens: number,
  temperature: number,
): Promise<{ message: string }> => {
  return sendToBackground(MSG_INITIALIZE_AI, {
    apiKey,
    baseUrl,
    defaultModel,
    maxHistoryMessages,
    systemPrompt,
    maxTokens,
    temperature,
  })
}

/**
 * Reset the AI service
 */
export const resetAI = async (): Promise<{ message: string }> => {
  return sendToBackground(MSG_RESET_AI, {})
}

/**
 * Send a message to AI and get a complete response
 */
export const fetchAIMessage = async (params: {
  dialogId: string
}): Promise<{ dialog: DialogItem; messages: AIMessage[] }> => {
  return sendToBackground(MSG_FETCH_AI_MESSAGE, params)
}

/**
 * Initialize a new stream with a query
 */
export const searchAIMessageStream = async ({
  dialogId,
  query,
}: {
  dialogId: string
  query: string
}): Promise<{ dialog: DialogItem }> => {
  return sendToBackground(MSG_SEARCH_AI_MESSAGE_STREAM, {
    dialogId,
    query,
  })
}

/**
 * Get the dialogs
 */
export const getDialogs = async (): Promise<{ dialogs: DialogItem[] }> => {
  return sendToBackground(MSG_GET_DIALOGS)
}

/**
 * Delete a dialog
 */
export const deleteDialog = async (dialogId: string): Promise<void> => {
  return sendToBackground(MSG_DELETE_DIALOG, { dialogId })
}

/**
 * Setup Chrome runtime message listener for content script
 * Listens for messages from background script and dispatches custom events
 */
export const setupMessageListener = (): void => {
  chrome.runtime.onMessage.addListener((message) => {
    document.dispatchEvent(new CustomEvent<StreamMessage>(MSG_AI_STREAM_CHUNK, { detail: message }))
  })
}
