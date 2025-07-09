import { STORAGE_KEYS } from '@/consts/keyboard'

import { addStorageChangeListener, getStorageItem, setStorageItem } from './index'

export const getKeyboardShortcut = async (): Promise<string | null> => {
  return getStorageItem<string>(STORAGE_KEYS.keyboardShortcut)
}

export const setKeyboardShortcut = async (shortcut: string): Promise<void> => {
  return setStorageItem(STORAGE_KEYS.keyboardShortcut, shortcut)
}

export const onKeyboardShortcutChange = (
  callback: (shortcut: string | null) => void,
): (() => void) => {
  return addStorageChangeListener((changes) => {
    if (changes[STORAGE_KEYS.keyboardShortcut]) {
      const newValue = changes[STORAGE_KEYS.keyboardShortcut].newValue as string | null
      callback(newValue)
    }
  })
}
