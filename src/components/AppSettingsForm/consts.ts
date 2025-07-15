import {
  DEFAULT_BASE_FONT_SIZE,
  DEFAULT_BASE_HEIGHT,
  DEFAULT_BASE_WIDTH,
  DEFAULT_KEYBOARD_SHORTCUT,
  STORAGE_KEYS,
} from '@/consts/keyboard'

export type AppSettingsFormData = {
  [STORAGE_KEYS.keyboardShortcut]: string
  [STORAGE_KEYS.baseFontSize]: number
  [STORAGE_KEYS.baseWidth]: number
  [STORAGE_KEYS.baseHeight]: number
}

export const defaultFormState: AppSettingsFormData = {
  [STORAGE_KEYS.keyboardShortcut]: DEFAULT_KEYBOARD_SHORTCUT,
  [STORAGE_KEYS.baseFontSize]: DEFAULT_BASE_FONT_SIZE,
  [STORAGE_KEYS.baseWidth]: DEFAULT_BASE_WIDTH,
  [STORAGE_KEYS.baseHeight]: DEFAULT_BASE_HEIGHT,
}
