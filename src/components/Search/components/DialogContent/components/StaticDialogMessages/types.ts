import { FC } from 'react'

import { AIMessage } from '@/lib/messaging/types'

export type Props = FC<{
  messages: AIMessage[]
}>
