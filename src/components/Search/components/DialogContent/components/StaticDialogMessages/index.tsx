import { memo } from 'react'

import { MessageBubble } from '@/components/MessageBubble'

import { Props } from './types'

export const StaticDialogMessages: Props = memo(({ messages }) => {
  return (
    <>
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
    </>
  )
})
