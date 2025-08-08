import OpenAI from 'openai'

import {
  MSG_DELETE_DIALOG,
  MSG_FETCH_AI_MESSAGE,
  MSG_GET_DIALOGS,
  MSG_INITIALIZE_AI,
  MSG_RESET_AI,
  MSG_SEARCH_AI_MESSAGE_STREAM,
} from '@/consts/messages'
import { ChunkMessage } from '@/lib/messaging/types'

import { OpenAIConfig } from '../../clients/openaiClient/types'
import type { ContentMessage, InitConfig } from '../../types'
import { HistoryService } from '../historyService'
import { HistoryServiceExternalParams } from '../historyService/types'
import type { BackgroundResponse } from './types'
import { errorResponse, isAdditionalParamsAllowed, successResponse } from './utils'

export class MessageService {
  private historyService: HistoryService | null = null
  private openaiClient: OpenAI | null = null
  private defaultModel: string | undefined = undefined
  private systemPrompt: string | undefined = undefined
  private maxTokens: number | undefined = undefined
  private temperature: number | undefined = undefined
  private createHistoryService: (config: HistoryServiceExternalParams) => HistoryService
  private createOpenAIClient: (config: OpenAIConfig) => OpenAI

  constructor({
    createHistoryService,
    createOpenAIClient,
  }: {
    createHistoryService: (config: HistoryServiceExternalParams) => HistoryService
    createOpenAIClient: (config: OpenAIConfig) => OpenAI
  }) {
    this.createHistoryService = createHistoryService
    this.createOpenAIClient = createOpenAIClient
  }

  async handleMessage(
    message: ContentMessage,
    createChannel: (dialogId: string) => (chunk: string) => void,
  ): Promise<BackgroundResponse> {
    const { type, payload } = message

    if (type === MSG_INITIALIZE_AI) {
      return this.handleInitializeAI(payload)
    }

    if (type === MSG_RESET_AI) {
      return this.handleResetAI()
    }

    if (!this.historyService || !this.openaiClient) {
      return errorResponse('AI service not initialized. Please provide API configuration first.')
    }

    try {
      switch (type) {
        case MSG_FETCH_AI_MESSAGE:
          return this.handleFetchAIMessage(payload)

        case MSG_SEARCH_AI_MESSAGE_STREAM:
          return this.handleSearchAIMessageStream(payload, createChannel)

        case MSG_GET_DIALOGS:
          return this.handleGetDialogs()

        case MSG_DELETE_DIALOG:
          return this.handleDeleteDialog(payload)

        default:
          return errorResponse(`Unknown message type: ${type}`)
      }
    } catch (error) {
      return errorResponse('Unknown error', error)
    }
  }

  private async handleInitializeAI(payload: InitConfig): Promise<BackgroundResponse> {
    const {
      apiKey,
      baseUrl,
      defaultModel,
      systemPrompt,
      maxTokens,
      temperature,
      maxHistoryMessages,
    } = payload

    if (!apiKey || !baseUrl || !defaultModel || !systemPrompt || !maxTokens || !temperature) {
      return errorResponse('Some initialization parameters are missing')
    }

    try {
      this.openaiClient = this.createOpenAIClient({ apiKey, baseUrl })
      this.defaultModel = defaultModel
      this.systemPrompt = systemPrompt
      this.maxTokens = isAdditionalParamsAllowed(defaultModel) ? maxTokens : undefined
      this.temperature = isAdditionalParamsAllowed(defaultModel) ? temperature : undefined

      this.historyService = this.createHistoryService({
        maxHistoryMessages,
      })

      return successResponse({ message: 'AI service initialized successfully' })
    } catch (error) {
      return errorResponse('Failed to initialize service', error)
    }
  }

  private async handleResetAI(): Promise<BackgroundResponse> {
    try {
      this.historyService = null
      this.openaiClient = null
      this.defaultModel = undefined
      this.systemPrompt = undefined
      this.maxTokens = undefined
      this.temperature = undefined

      return successResponse({ message: 'AI service reset successfully' })
    } catch (error) {
      return errorResponse('Failed to reset service', error)
    }
  }

  private async handleSearchAIMessageStream(
    payload: { dialogId: string; query: string },
    createChannel: (dialogId: string) => (chunk: string) => void,
  ): Promise<BackgroundResponse> {
    try {
      const onChunk = createChannel(payload.dialogId)

      const userMessage = {
        role: 'user' as const,
        content: payload.query,
        index: 0,
      }
      onChunk(JSON.stringify(userMessage))

      const existingHistory = await this.historyService!.getHistory(payload.dialogId)
      if (!existingHistory) {
        await this.historyService!.createInitialDialog(payload.dialogId, payload.query)
        const systemMessage = {
          role: 'system' as const,
          content: this.systemPrompt!,
        }
        await this.historyService!.addMessage(payload.dialogId, systemMessage)
      }

      await this.historyService!.addMessage(payload.dialogId, userMessage)

      const history = await this.historyService!.getHistory(payload.dialogId)
      if (!history) {
        return errorResponse('History not found')
      }

      const content = await this.streamResponse(history.messages, onChunk)

      const assistantMessage = {
        role: 'assistant' as const,
        content,
      }
      await this.historyService!.addMessage(payload.dialogId, assistantMessage)

      const updatedHistory = await this.historyService!.getHistory(payload.dialogId)
      if (!updatedHistory) {
        return errorResponse('History not found')
      }

      return successResponse({
        // NOTE: Exclude system message
        messages: updatedHistory.messages.slice(1),
        dialog: updatedHistory.dialog,
      })
    } catch (error) {
      return errorResponse('Failed to send message', error)
    }
  }

  private async streamResponse(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    onChunk?: (chunk: string) => void,
  ): Promise<string> {
    const stream = await this.openaiClient!.chat.completions.create({
      model: this.defaultModel!,
      messages,
      stream: true,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
    })

    let content = ''
    // NOTE: assuming that the first message was a user message
    let index = 1

    for await (const part of stream) {
      const chunk = part.choices[0]?.delta?.content
      if (chunk) {
        content += chunk
        onChunk?.(JSON.stringify(this.createChunkMessage(chunk, index)))
        index += 1
      }
    }

    onChunk?.(JSON.stringify(this.createChunkMessage('', index, true)))

    return content
  }

  private createChunkMessage(content: string, index: number, isDone = false): ChunkMessage {
    return { role: 'assistant', content, index, isDone }
  }

  private async handleFetchAIMessage(payload: { dialogId: string }): Promise<BackgroundResponse> {
    try {
      if (!payload.dialogId) {
        return errorResponse('dialogId is required')
      }

      const history = await this.historyService!.getUserHistory(payload.dialogId)
      if (!history) {
        return errorResponse('History not found')
      }
      // NOTE: Exclude system message
      history.messages = history.messages.slice(1)
      return successResponse(history)
    } catch (error) {
      return errorResponse('Failed to fetch message', error)
    }
  }

  private async handleGetDialogs(): Promise<BackgroundResponse> {
    try {
      const dialogs = await this.historyService!.getDialogs()
      return successResponse({ dialogs })
    } catch (error) {
      return errorResponse('Failed to get dialogs', error)
    }
  }

  private async handleDeleteDialog(payload: { dialogId: string }): Promise<BackgroundResponse> {
    try {
      await this.historyService!.deleteDialog(payload.dialogId)
      return successResponse({ message: 'Dialog deleted successfully' })
    } catch (error) {
      return errorResponse('Failed to delete dialog', error)
    }
  }
}
