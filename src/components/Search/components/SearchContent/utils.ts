import { DialogItem } from '@/lib/messaging/types'

export const getDefaultDialog = (id?: string): DialogItem => {
  return {
    id: id || '',
    label: 'New dialog',
  }
}
