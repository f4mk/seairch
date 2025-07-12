import { FC } from 'react'

export type KeyboardEventContextType = {
  allowEvent: (e: KeyboardEvent) => void
  isAllowed: (e: KeyboardEvent) => boolean
}

export type Props = FC<{
  children: React.ReactNode
}>
