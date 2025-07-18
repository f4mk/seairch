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
import { errorResponse, successResponse } from './utils'

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

    if (type === MSG_INITIALIZE_AI) {
      return this.handleInitializeAI(payload)
    }

    if (type === MSG_RESET_AI) {
      return this.handleResetAI()
    }

    if (!this.historyService) {
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
    const { apiKey, baseUrl, defaultModel, ...config } = payload

    if (!apiKey || !baseUrl || !defaultModel) {
      return errorResponse('API key, base URL, and default model are required')
    }

    try {
      const client = this.createOpenAIClient({ apiKey, baseUrl })

      this.historyService = this.createHistoryService({
        client,
        defaultModel,
        ...config,
      })

      return successResponse({ message: 'AI service initialized successfully' })
    } catch (error) {
      return errorResponse('Failed to initialize service', error)
    }
  }

  private async handleResetAI(): Promise<BackgroundResponse> {
    try {
      // TODO: reset history service
      this.historyService = null

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

      const chunkMessage: ChunkMessage = {
        role: 'user',
        content: payload.query,
        index: 0,
      }
      onChunk(JSON.stringify(chunkMessage))

      const result = await this.historyService!.sendMessage(chunkMessage, payload.dialogId, onChunk)

      return successResponse(result)
    } catch (error) {
      return errorResponse('Failed to send message', error)
    }
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
