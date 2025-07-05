import { DialogItem } from '@/lib/messaging/types'

export const getDefaultDialog = (): DialogItem => {
  return {
    id: '',
    label: 'New dialog',
  }
}
