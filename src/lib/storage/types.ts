import { STORAGE_KEYS } from '@/consts/ai'
import { STORAGE_KEYS as KEYBOARD_STORAGE_KEYS } from '@/consts/keyboard'

export type AIConfig = KeyedRecord<typeof STORAGE_KEYS, string>

export type VisualSettingsForm = KeyedRecord<
  Omit<typeof KEYBOARD_STORAGE_KEYS, 'keyboardShortcut'>,
  number
>
