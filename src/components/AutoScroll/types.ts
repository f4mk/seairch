import { FC, RefObject } from 'react'

export type Props = FC<{
  scrollBehavior?: ScrollBehavior
  children: React.ReactNode
  threshold?: number
  scrollContainerRef: RefObject<HTMLElement | null>
}>
