import { FC } from 'react'

export type Props = FC<{
  configNames: string[]
  initialConfigName: string
  isCollapsed: boolean
  onClose: () => void
  onCollapse: () => void
}>
