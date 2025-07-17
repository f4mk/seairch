import { useCallback, useRef } from 'react'

import { KEYBOARD_SHORTCUT_DELAY } from '@/consts/keyboard'

export const useFocus = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleFocus = useCallback(() => {
    setTimeout(() => {
      textareaRef.current?.focus()
    }, KEYBOARD_SHORTCUT_DELAY)
  }, [])

  return {
    textareaRef,
    handleFocus,
  }
}
