import { useKeyboardEventProviderValue } from '@/hooks/useKeyboardEventProviderValue'

export const useAllowEvents = () => {
  const contextValue = useKeyboardEventProviderValue()

  return contextValue.allowEvent
}
