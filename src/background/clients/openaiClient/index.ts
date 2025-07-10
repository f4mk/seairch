import OpenAI from 'openai'

import { customFetch } from '@/lib/utils'

import { OpenAIConfig } from './types'

export const createOpenAIClient = (config: OpenAIConfig): OpenAI => {
  return new OpenAI({
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
    dangerouslyAllowBrowser: true,
    fetch: customFetch,
  })
}
