import OpenAI from 'openai'

export type OpenAIConfig = {
  apiKey: string
  baseUrl: string
}

export const createOpenAIClient = (config: OpenAIConfig): OpenAI => {
  return new OpenAI({
    baseURL: config.baseUrl,
    apiKey: config.apiKey,
    dangerouslyAllowBrowser: true,
  })
}
