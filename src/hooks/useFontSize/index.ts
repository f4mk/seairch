import { useEffect, useState } from 'react'

import { FONT_SIZE_DEFAULT, FONT_SIZE_MAX, FONT_SIZE_MIN } from '@/consts/visuals'

import { FONT_SIZE_STEP } from './consts'
import { UseFontSizeProps } from './types'

export const useFontSize = ({
  initialSize = FONT_SIZE_DEFAULT,
  minSize = FONT_SIZE_MIN,
  maxSize = FONT_SIZE_MAX,
  step = FONT_SIZE_STEP,
}: UseFontSizeProps = {}) => {
  const [fontSize, setFontSize] = useState(initialSize)

  const increase = () => {
    setFontSize((prev) => Math.min(prev + step, maxSize))
  }

  const decrease = () => {
    setFontSize((prev) => Math.max(prev - step, minSize))
  }

  useEffect(() => {
    setFontSize(initialSize)
  }, [initialSize])

  return {
    fontSize,
    increase,
    decrease,
    canIncrease: fontSize < maxSize,
    canDecrease: fontSize > minSize,
  }
}
