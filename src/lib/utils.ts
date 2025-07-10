import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { STORAGE_KEYS } from '@/consts/ai'

import { initializeAI } from './messaging'
import { AIConfig } from './storage/types'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}
export const applyDarkClass = (target: HTMLElement) => {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  try {
    target.classList.toggle('dark', media.matches)
    media.addEventListener('change', (e) => {
      target.classList.toggle('dark', e.matches)
    })
  } catch (error) {
    console.error('Error applying dark class', error)
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = <T extends (...args: any[]) => void>(cb: T, delay: number): T => {
  let timeoutId: number | null = null
  return ((...args: Parameters<T>) => {
    if (timeoutId === null) {
      timeoutId = window.setTimeout(() => {
        cb(...args)
        timeoutId = null
      }, delay)
    }
  }) as T
}
export const generateDialogId = (): string => {
  return `dialog_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Initialize an AI configuration
 * @param config The AI configuration to initialize
 */
export const initAIConfig = async (config: AIConfig) => {
  if (
    !config[STORAGE_KEYS.apiKey] ||
    !config[STORAGE_KEYS.baseUrl] ||
    !config[STORAGE_KEYS.modelName] ||
    !config[STORAGE_KEYS.maxHistoryMessages] ||
    !config[STORAGE_KEYS.maxTokens] ||
    !config[STORAGE_KEYS.temperature]
  ) {
    throw new Error('Missing required configuration parameters')
  }

  return initializeAI(
    config[STORAGE_KEYS.apiKey],
    config[STORAGE_KEYS.baseUrl],
    config[STORAGE_KEYS.modelName],
    Number(config[STORAGE_KEYS.maxHistoryMessages]),
    config[STORAGE_KEYS.systemPrompt],
    Number(config[STORAGE_KEYS.maxTokens]),
    Number(config[STORAGE_KEYS.temperature]),
  )
}

export const customFetch = async (
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> => {
  if (!init) {
    init = {}
  }

  const cleanHeaders = new Headers()

  if (init.headers) {
    const originalHeaders = new Headers(init.headers)
    for (const [key, value] of originalHeaders.entries()) {
      if (!key.toLowerCase().startsWith('x-stainless-')) {
        cleanHeaders.set(key, value)
      }
    }
  }

  const cleanInit: RequestInit = {
    ...init,
    headers: cleanHeaders,
  }

  return fetch(input, cleanInit)
}
