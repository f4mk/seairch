import { FC } from 'react'

export type Props = FC<{
  onClose: () => void
  configNames: string[]
  initialConfigName: string
}>
