import { DialogItem } from '@/lib/messaging/types'
import { generateDialogId } from '@/lib/utils'

export const getDefaultDialog = (): DialogItem => {
  return {
    id: generateDialogId(),
    label: 'New dialog',
  }
}
