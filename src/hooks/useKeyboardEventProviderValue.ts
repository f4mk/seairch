import { useMemo, useRef } from 'react'

export const useKeyboardEventProviderValue = () => {
  const allowedEvents = useRef<WeakSet<KeyboardEvent>>(new WeakSet())

  const contextValue = useMemo(
    () => ({
      allowEvent: (e: KeyboardEvent) => {
        allowedEvents.current.add(e)
      },
      isAllowed: (e: KeyboardEvent) => {
        return allowedEvents.current.has(e)
      },
    }),
    [],
  )

  return contextValue
}
