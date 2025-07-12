import { useKeyboardEventProviderValue } from '@/hooks/useKeyboardEventProviderValue'

import { KeyboardEventContext } from './context'
import { Props } from './types'

export const KeyboardEventProvider: Props = ({ children }) => {
  const value = useKeyboardEventProviderValue()
  return <KeyboardEventContext.Provider value={value}>{children}</KeyboardEventContext.Provider>
}
