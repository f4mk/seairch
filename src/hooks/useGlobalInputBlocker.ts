import { useEffect } from 'react'

import { KEY_ESCAPE } from '@/consts/keyboard'
import { useKeyboardEventProviderValue } from '@/hooks/useKeyboardEventProviderValue'
import { matchesKeyboardShortcut } from '@/lib/keyboardShortcut'
import { KeyboardShortcut } from '@/lib/keyboardShortcut/types'

export const useGlobalInputBlocker = (
  shadowHost: ShadowRoot,
  shortcut: KeyboardShortcut | null,
) => {
  const { isAllowed } = useKeyboardEventProviderValue()

  useEffect(() => {
    if (!shadowHost) return

    const handler = (e: Event) => {
      if (!(e instanceof KeyboardEvent)) return

      const target = e.target as Node
      const isFromShadow = shadowHost.contains(target)

      const allowShortcut =
        e.key === KEY_ESCAPE || (shortcut && matchesKeyboardShortcut(e, shortcut))
      const isExplicitlyAllowed = isAllowed(e)

      if (isFromShadow && !allowShortcut && !isExplicitlyAllowed) {
        e.stopPropagation()
        e.stopImmediatePropagation()
      }
    }

    const events: (keyof HTMLElementEventMap)[] = ['keydown', 'keypress', 'keyup']

    for (const event of events) {
      shadowHost.addEventListener(event, handler as EventListener, false)
    }

    return () => {
      for (const event of events) {
        shadowHost.removeEventListener(event, handler as EventListener, false)
      }
    }
  }, [shadowHost, shortcut, isAllowed])
}
