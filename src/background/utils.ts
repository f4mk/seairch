import { HistoryClient } from './clients/historyClient'
import { createOpenAIClient } from './clients/openaiClient'
import { OpenAIConfig } from './clients/openaiClient/types'
import { HistoryService } from './services/historyService'
import { HistoryServiceExternalParams } from './services/historyService/types'
import { MessageService } from './services/messageService'

export const createMessageService = () => {
  return new MessageService({
    createHistoryService: (params: HistoryServiceExternalParams) =>
      HistoryService.create({
        ...params,
        historyClient: HistoryClient.create({ maxHistoryMessages: params.maxHistoryMessages }),
      }),
    createOpenAIClient: (config: OpenAIConfig) => createOpenAIClient(config),
  })
}
