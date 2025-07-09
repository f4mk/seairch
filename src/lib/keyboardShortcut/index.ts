import { DEFAULT_KEYBOARD_SHORTCUT, REGEX_KEYBOARD_SHORTCUT } from '@/consts/keyboard'

import { KeyboardShortcut } from './types'

const isMacPlatform = (): boolean => {
  // Modern approach: use navigator.userAgentData.platform (Chrome 89+)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('userAgentData' in navigator && (navigator as any).userAgentData?.platform) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (navigator as any).userAgentData.platform.toLowerCase() === 'macos'
  }

  if (navigator.platform) {
    return navigator.platform.toLowerCase().includes('mac')
  }

  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('mac') || userAgent.includes('macintosh')
}

export const parseKeyboardShortcut = (shortcut: string): KeyboardShortcut | null => {
  const finalShortcut = (shortcut || DEFAULT_KEYBOARD_SHORTCUT).toUpperCase()

  if (finalShortcut.length === 1 && REGEX_KEYBOARD_SHORTCUT.test(finalShortcut)) {
    const isMac = isMacPlatform()
    return {
      ctrlKey: !isMac,
      metaKey: isMac,
      key: finalShortcut,
    }
  }

  return null
}

export const matchesKeyboardShortcut = (
  event: KeyboardEvent,
  shortcut: KeyboardShortcut,
): boolean => {
  if (event.key.toUpperCase() !== shortcut.key) {
    return false
  }

  if (shortcut.ctrlKey && shortcut.metaKey) {
    const isMac = isMacPlatform()
    return (isMac ? event.metaKey : event.ctrlKey) && !event.shiftKey && !event.altKey
  }

  return (
    event.ctrlKey === shortcut.ctrlKey &&
    event.metaKey === shortcut.metaKey &&
    !event.shiftKey &&
    !event.altKey
  )
}
