import { STORAGE_KEYS } from '@/consts/keyboard'
import {
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  HEIGHT_MAX,
  HEIGHT_MIN,
  WIDTH_MAX,
  WIDTH_MIN,
} from '@/consts/visuals'

import { AppSettingsFormData } from './consts'

export const validateAndFixFormData = (data: AppSettingsFormData): AppSettingsFormData => {
  const validated = { ...data }

  const fontSize = parseInt(String(data[STORAGE_KEYS.baseFontSize]), 10)
  if (isNaN(fontSize) || fontSize < FONT_SIZE_MIN) {
    validated[STORAGE_KEYS.baseFontSize] = FONT_SIZE_MIN
  } else if (fontSize > FONT_SIZE_MAX) {
    validated[STORAGE_KEYS.baseFontSize] = FONT_SIZE_MAX
  } else {
    validated[STORAGE_KEYS.baseFontSize] = fontSize
  }

  const width = parseInt(String(data[STORAGE_KEYS.baseWidth]), 10)
  if (isNaN(width) || width < WIDTH_MIN) {
    validated[STORAGE_KEYS.baseWidth] = WIDTH_MIN
  } else if (width > WIDTH_MAX) {
    validated[STORAGE_KEYS.baseWidth] = WIDTH_MAX
  } else {
    validated[STORAGE_KEYS.baseWidth] = width
  }

  const height = parseInt(String(data[STORAGE_KEYS.baseHeight]), 10)
  if (isNaN(height) || height < HEIGHT_MIN) {
    validated[STORAGE_KEYS.baseHeight] = HEIGHT_MIN
  } else if (height > HEIGHT_MAX) {
    validated[STORAGE_KEYS.baseHeight] = HEIGHT_MAX
  } else {
    validated[STORAGE_KEYS.baseHeight] = height
  }

  return validated
}
