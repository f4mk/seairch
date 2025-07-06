import OpenAI from 'openai'

import {
  DEFAULT_MAX_HISTORY_MESSAGES,
  DEFAULT_MAX_TOKENS,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_TEMPERATURE,
} from '@/consts/background'
import {
  MSG_DELETE_DIALOG,
  MSG_FETCH_AI_MESSAGE,
  MSG_GET_DIALOGS,
  MSG_INITIALIZE_AI,
  MSG_RESET_AI,
  MSG_SEARCH_AI_MESSAGE_STREAM,
  MSG_UPDATE_AI,
} from '@/consts/messages'
import { ChunkMessage } from '@/lib/messaging/types'

import { OpenAIConfig } from '../../clients/openaiClient'
import type { BackgroundResponse, ContentMessage, InitConfig } from '../../types'
import { HistoryService } from '../historyService'
import { HistoryServiceExternalParams } from '../historyService/types'

export class MessageService {
  private historyService: HistoryService | null = null
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

    try {
      switch (type) {
        case MSG_INITIALIZE_AI:
          return this.handleInitializeAI(payload)

        case MSG_RESET_AI:
          return this.handleResetAI()

        case MSG_UPDATE_AI:
          return this.handleUpdateAI(payload)

        case MSG_FETCH_AI_MESSAGE:
          return this.handleFetchAIMessage(payload)

        case MSG_SEARCH_AI_MESSAGE_STREAM:
          return this.handleSearchAIMessageStream(payload, createChannel)

        case MSG_GET_DIALOGS:
          return this.handleGetDialogs()

        case MSG_DELETE_DIALOG:
          return this.handleDeleteDialog(payload)

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

    if (!apiKey || !baseUrl || !defaultModel) {
      return {
        success: false,
        error: 'API key, base URL, and default model are required',
      }
    }

    try {
      const client = this.createOpenAIClient({ apiKey, baseUrl })

      this.historyService = this.createHistoryService({
        client,
        defaultModel,
        systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
        maxTokens: maxTokens || DEFAULT_MAX_TOKENS,
        temperature: temperature || DEFAULT_TEMPERATURE,
        maxHistoryMessages: maxHistoryMessages || DEFAULT_MAX_HISTORY_MESSAGES,
      })

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

  private async handleUpdateAI(payload: Record<string, unknown>): Promise<BackgroundResponse> {
    if (!this.historyService) {
      return {
        success: false,
        error: 'AI service not initialized. Please initialize the service first.',
      }
    }

    try {
      const systemPrompt = payload.systemPrompt as string
      const maxTokens = payload.maxTokens as number
      const temperature = payload.temperature as number

      this.historyService.updateSettings({
        systemPrompt,
        maxTokens,
        temperature,
      })

      return {
        success: true,
        data: { message: 'AI service updated successfully' },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update service',
      }
    }
  }

  private async handleResetAI(): Promise<BackgroundResponse> {
    try {
      // TODO: reset history service
      this.historyService = null

      return {
        success: true,
        data: { message: 'AI service reset successfully' },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset service',
      }
    }
  }
  private async handleSearchAIMessageStream(
    payload: { dialogId: string; query: string },
    createChannel: (dialogId: string) => (chunk: string) => void,
  ): Promise<BackgroundResponse> {
    if (!this.historyService) {
      return {
        success: false,
        error: 'AI service not initialized. Please provide API configuration first.',
      }
    }

    try {
      const onChunk = createChannel(payload.dialogId)

      const chunkMessage: ChunkMessage = {
        role: 'user',
        content: payload.query,
        index: 0,
      }
      onChunk(JSON.stringify(chunkMessage))

      const result = await this.historyService.sendMessage(chunkMessage, payload.dialogId, onChunk)

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      }
    }
  }

  private async handleFetchAIMessage(payload: { dialogId: string }): Promise<BackgroundResponse> {
    if (!this.historyService) {
      return {
        success: false,
        error: 'AI service not initialized. Please provide API configuration first.',
      }
    }

    try {
      if (!payload.dialogId) {
        return {
          success: false,
          error: 'dialogId is required',
        }
      }

      const history = await this.historyService.getUserHistory(payload.dialogId)
      if (!history) {
        return {
          success: false,
          error: 'History not found',
        }
      }

      return {
        success: true,
        data: history,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch message',
      }
    }
  }

  private async handleGetDialogs(): Promise<BackgroundResponse> {
    if (!this.historyService) {
      return {
        success: false,
        error: 'Message service not initialized. Please initialize the service first.',
      }
    }

    try {
      const dialogs = await this.historyService.getDialogs()
      return {
        success: true,
        data: {
          dialogs,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get dialogs',
      }
    }
  }

  private async handleDeleteDialog(payload: { dialogId: string }): Promise<BackgroundResponse> {
    if (!this.historyService) {
      return {
        success: false,
        error: 'Message service not initialized. Please initialize the service first.',
      }
    }

    try {
      await this.historyService.deleteDialog(payload.dialogId)
      return {
        success: true,
        data: { message: 'Dialog deleted successfully' },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete dialog',
      }
    }
  }
}
