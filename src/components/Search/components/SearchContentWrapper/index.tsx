import { Spinner } from '@/components/Spinner'

import { DialogContent } from '../DialogContent'
import { NEW_DIALOG_ID } from '../SearchContent/consts'
import { SearchIcon } from '../SearchIcon'
import { Props } from './types'

export const SearchContentWrapper: Props = ({ isLoading, messages, dialogId, isStreaming }) => {
  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <Spinner />
      </div>
    )
  }

  if (messages.length > 0 || dialogId !== NEW_DIALOG_ID) {
    return (
      <DialogContent messages={messages} isStreaming={isStreaming} currentDialogId={dialogId} />
    )
  }

  return (
    <div className='flex flex-1 items-center justify-center text-secondary-foreground'>
      <SearchIcon className='text-muted-foreground select-none' />
    </div>
  )
}
