import {
  MSG_DELETE_DIALOG,
  MSG_FETCH_AI_MESSAGE,
  MSG_GET_DIALOGS,
  MSG_INITIALIZE_AI,
  MSG_RESET_AI,
  MSG_SEARCH_AI_MESSAGE_STREAM,
  MSG_UPDATE_AI,
} from '@/consts/messages'

import type { AIMessage, DialogItem, MessageType, ResponseMessage } from './types'

/**
 * Send a message to the background script and wait for a response
 * @param type - Message type
 * @param payload - Message payload
 * @returns Promise that resolves with the response
 */
async function sendToBackground<T = unknown>(
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

export async function initializeAI(
  apiKey: string,
  baseUrl: string,
  defaultModel: string,
  maxHistoryMessages: number,
): Promise<{ message: string }> {
  return sendToBackground(MSG_INITIALIZE_AI, {
    apiKey,
    baseUrl,
    defaultModel,
    maxHistoryMessages,
  })
}

/**
 * Reset the AI service
 */
export async function resetAI(): Promise<{ message: string }> {
  return sendToBackground(MSG_RESET_AI, {})
}

/**
 * Update the AI service
 */
export async function updateAI(payload: Record<string, unknown>): Promise<{ message: string }> {
  return sendToBackground(MSG_UPDATE_AI, payload)
}

/**
 * Send a message to AI and get a complete response
 */
export async function fetchAIMessage(params: {
  dialogId: string
}): Promise<{ dialog: DialogItem; messages: AIMessage[] }> {
  return sendToBackground(MSG_FETCH_AI_MESSAGE, params)
}

export async function searchAIMessageStream({
  dialogId,
  query,
}: {
  dialogId: string
  query: string
}): Promise<{ dialog: DialogItem }> {
  return sendToBackground(MSG_SEARCH_AI_MESSAGE_STREAM, {
    dialogId,
    query,
  })
}

/**
 * Get the dialogs
 */
export async function getDialogs(): Promise<{ dialogs: DialogItem[] }> {
  return sendToBackground(MSG_GET_DIALOGS)
}

/**
 * Delete a dialog
 */
export async function deleteDialog(dialogId: string): Promise<void> {
  return sendToBackground(MSG_DELETE_DIALOG, { dialogId })
}
