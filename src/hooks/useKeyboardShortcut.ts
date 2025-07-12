import { useEffect, useState } from 'react'

import { DEFAULT_KEYBOARD_SHORTCUT } from '@/consts/keyboard'
import { parseKeyboardShortcut } from '@/lib/keyboardShortcut'
import type { KeyboardShortcut } from '@/lib/keyboardShortcut/types'
import { getKeyboardShortcut, onKeyboardShortcutChange } from '@/lib/storage/keyboard'

export const useKeyboardShortcut = () => {
  const [shortcut, setShortcut] = useState<KeyboardShortcut | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadShortcut = async () => {
      try {
        const shortcutText = await getKeyboardShortcut()
        const finalShortcut = shortcutText || DEFAULT_KEYBOARD_SHORTCUT
        const parsedShortcut = parseKeyboardShortcut(finalShortcut)
        setShortcut(parsedShortcut)
      } catch (error) {
        console.error('Error loading keyboard shortcut:', error)
        const parsedShortcut = parseKeyboardShortcut(DEFAULT_KEYBOARD_SHORTCUT)
        setShortcut(parsedShortcut)
      } finally {
        setIsLoading(false)
      }
    }

    void loadShortcut()

    const unsubscribe = onKeyboardShortcutChange((shortcutText) => {
      const finalShortcut = shortcutText || DEFAULT_KEYBOARD_SHORTCUT
      const parsedShortcut = parseKeyboardShortcut(finalShortcut)
      setShortcut(parsedShortcut)
    })

    return unsubscribe
  }, [])

  return { shortcut, isLoading }
}
