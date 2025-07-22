import { HistoryClient } from '../../clients/historyClient'

export type HistoryServiceConfig = {
  historyClient: HistoryClient
}

export type HistoryServiceExternalParams = {
  maxHistoryMessages: number
}
