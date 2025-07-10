import { STORAGE_KEYS } from '@/consts/ai'
import {
  DEFAULT_MAX_HISTORY_MESSAGES,
  DEFAULT_MAX_TOKENS,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_TEMPERATURE,
} from '@/consts/background'
import { AIConfig } from '@/lib/storage/types'

export const defaultFormState: AIConfig = {
  [STORAGE_KEYS.name]: '',
  [STORAGE_KEYS.apiKey]: '',
  [STORAGE_KEYS.modelName]: '',
  [STORAGE_KEYS.baseUrl]: '',
  [STORAGE_KEYS.maxHistoryMessages]: String(DEFAULT_MAX_HISTORY_MESSAGES),
  [STORAGE_KEYS.systemPrompt]: DEFAULT_SYSTEM_PROMPT,
  [STORAGE_KEYS.maxTokens]: String(DEFAULT_MAX_TOKENS),
  [STORAGE_KEYS.temperature]: String(DEFAULT_TEMPERATURE),
}
