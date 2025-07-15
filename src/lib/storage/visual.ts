import { STORAGE_KEYS, VISUAL_CONFIG_KEY } from '@/consts/keyboard'

import { addStorageChangeListener, getStorageItem, setStorageItem } from './index'
import { VisualSettingsForm } from './types'

export const saveVisualSettings = async (settings: VisualSettingsForm): Promise<void> => {
  return setStorageItem(VISUAL_CONFIG_KEY, settings)
}

export const getVisualSettings = async (): Promise<VisualSettingsForm | null> => {
  return getStorageItem<VisualSettingsForm>(VISUAL_CONFIG_KEY)
}

export const onVisualSettingsChange = (
  callback: (settings: VisualSettingsForm) => void,
): (() => void) => {
  return addStorageChangeListener((changes) => {
    const visualChanges: VisualSettingsForm = {
      [STORAGE_KEYS.baseFontSize]: 0,
      [STORAGE_KEYS.baseWidth]: 0,
      [STORAGE_KEYS.baseHeight]: 0,
    }

    if (changes[STORAGE_KEYS.baseFontSize]) {
      visualChanges[STORAGE_KEYS.baseFontSize] = changes[STORAGE_KEYS.baseFontSize]
        .newValue as number
    }
    if (changes[STORAGE_KEYS.baseWidth]) {
      visualChanges[STORAGE_KEYS.baseWidth] = changes[STORAGE_KEYS.baseWidth].newValue as number
    }
    if (changes[STORAGE_KEYS.baseHeight]) {
      visualChanges[STORAGE_KEYS.baseHeight] = changes[STORAGE_KEYS.baseHeight].newValue as number
    }

    callback(visualChanges)
  })
}
