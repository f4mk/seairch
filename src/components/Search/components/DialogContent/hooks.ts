import { useEffect, useState } from 'react'

import { STORAGE_KEYS } from '@/consts/keyboard'
import { FONT_SIZE_DEFAULT } from '@/consts/visuals'
import { useFontSize } from '@/hooks/useFontSize'
import { getVisualSettings } from '@/lib/storage/visual'

export const useFontSizeControl = () => {
  const [storedFontSize, setStoredFontSize] = useState(FONT_SIZE_DEFAULT)
  const { fontSize, increase, decrease, canIncrease, canDecrease } = useFontSize({
    initialSize: storedFontSize,
  })

  useEffect(() => {
    void getVisualSettings().then((settings) => {
      if (settings?.[STORAGE_KEYS.baseFontSize]) {
        setStoredFontSize(settings[STORAGE_KEYS.baseFontSize])
      }
    })
  }, [])

  return {
    fontSize,
    increase,
    decrease,
    canIncrease,
    canDecrease,
  }
}
