import { useCallback, useEffect, useRef, useState } from 'react'

import type { AIMessage, StreamChunk } from '../background/service/types'

export type UseAIStreamReturn = {
  isStreaming: boolean
  currentResponse: string
  error: string | null
  sendMessageStream: (messages: AIMessage[], options?: Record<string, unknown>) => Promise<void>
  sendMessage: (messages: AIMessage[], options?: Record<string, unknown>) => Promise<string>
  initializeService: (apiKey: string, baseUrl: string, defaultModel: string) => Promise<boolean>
  validateApiKey: (apiKey: string, baseUrl: string, defaultModel: string) => Promise<boolean>
  getModels: () => Promise<unknown[]>
  reset: () => void
}

export function useAIStream(): UseAIStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const [error, setError] = useState<string | null>(null)
  const currentRequestId = useRef<string | null>(null)

  // Listen for streaming chunks from background script
  useEffect(() => {
    const handleStreamChunk = (message: unknown) => {
      const msg = message as { type: string; payload: StreamChunk }
      if (msg.type === 'ai_stream_chunk') {
        const chunk: StreamChunk = msg.payload

        if (chunk.requestId === currentRequestId.current) {
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
        }
      }
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(handleStreamChunk)

    return () => {
      chrome.runtime.onMessage.removeListener(handleStreamChunk)
    }
  }, [])

  const generateRequestId = useCallback(() => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  const sendMessageToBackground = useCallback(
    async (type: string, payload: Record<string, unknown>) => {
      const requestId = generateRequestId()

      return new Promise<unknown>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type,
            payload,
            requestId,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message))
            } else if (response.success) {
              resolve(response.data)
            } else {
              reject(new Error(response.error || 'Unknown error'))
            }
          },
        )
      })
    },
    [generateRequestId],
  )

  const sendMessageStream = useCallback(
    async (messages: AIMessage[], options: Record<string, unknown> = {}) => {
      try {
        setError(null)
        setCurrentResponse('')
        setIsStreaming(true)

        const requestId = generateRequestId()
        currentRequestId.current = requestId

        await sendMessageToBackground('send_ai_message_stream', {
          messages,
          options,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start streaming')
        setIsStreaming(false)
        currentRequestId.current = null
      }
    },
    [sendMessageToBackground, generateRequestId],
  )

  const sendMessage = useCallback(
    async (messages: AIMessage[], options: Record<string, unknown> = {}): Promise<string> => {
      try {
        setError(null)
        const response = await sendMessageToBackground('send_ai_message', {
          messages,
          options,
        })
        return (response as { content: string }).content || ''
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [sendMessageToBackground],
  )

  const initializeService = useCallback(
    async (apiKey: string, baseUrl: string, defaultModel: string): Promise<boolean> => {
      try {
        setError(null)
        await sendMessageToBackground('initialize_ai', { apiKey, baseUrl, defaultModel })
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize service')
        return false
      }
    },
    [sendMessageToBackground],
  )

  const validateApiKey = useCallback(
    async (apiKey: string, baseUrl: string, defaultModel: string): Promise<boolean> => {
      try {
        const response = await sendMessageToBackground('validate_ai_api_key', {
          apiKey,
          baseUrl,
          defaultModel,
        })
        return (response as { isValid: boolean }).isValid
      } catch (_err) {
        return false
      }
    },
    [sendMessageToBackground],
  )

  const getModels = useCallback(async (): Promise<unknown[]> => {
    try {
      const response = await sendMessageToBackground('get_ai_models', {})
      return (response as { models: unknown[] }).models || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models')
      return []
    }
  }, [sendMessageToBackground])

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
    sendMessageStream,
    sendMessage,
    initializeService,
    validateApiKey,
    getModels,
    reset,
  }
}
 