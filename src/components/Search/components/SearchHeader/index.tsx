import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CardAction, CardHeader, CardTitle } from '@/components/ui/card'

import { Props } from './types'

export const SearchHeader: Props = ({ onClose }) => {
  return (
    <CardHeader className='pb-0 items-center pt-4'>
      <CardTitle className='select-none text-lg'>Search</CardTitle>
      <CardAction>
        <Button variant='ghost' size='sm' aria-label='Close search' onClick={onClose}>
          <X size={24} />
        </Button>
      </CardAction>
    </CardHeader>
  )
}
