import { FC } from 'react'

export type Props = FC<{
  onIncrease: () => void
  onDecrease: () => void
  canIncrease: boolean
  canDecrease: boolean
}>
