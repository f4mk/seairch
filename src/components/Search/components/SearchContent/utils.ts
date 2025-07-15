import { AIMessage, DialogItem } from '@/lib/messaging/types'

import { NEW_DIALOG_ID, NEW_DIALOG_LABEL } from './consts'
import { SearchResult } from './types'

export const getDefaultDialog = (id?: string): DialogItem => {
  return {
    id: id || '',
    label: NEW_DIALOG_LABEL,
  }
}
export const getErrorMessage = (error: Error | null) => {
  if (error) {
    const errorMessage = error.message || 'Unknown error occurred'
    const formattedError = `**Error:** ${errorMessage}`
    return [{ role: 'assistant', content: formattedError }] as AIMessage[]
  }
  return []
}

export const getMessages = (dialog: DialogItem, data?: SearchResult, error?: Error | null) => {
  if (error) {
    return getErrorMessage(error)
  }
  if (dialog.id === NEW_DIALOG_ID || data?.dialog?.id !== dialog.id) {
    return []
  }
  return data.messages || []
}
