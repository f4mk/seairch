import { createContext, useContext } from 'react'

import { KeyboardEventContextType } from './types'

const noop = () => {}

export const KeyboardEventContext = createContext<KeyboardEventContextType>({
  allowEvent: noop,
  isAllowed: () => false,
})

export const useKeyboardEventContext = () => useContext(KeyboardEventContext)
