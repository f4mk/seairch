import { FC } from 'react'

export type Props = FC<{
  onClose: () => void
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void
}>
