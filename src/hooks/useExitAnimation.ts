import { useState } from 'react'

import { DEFAULT_ANIMATION_DURATION } from '@/consts/styles'

type UseExitAnimationProps = {
  onClose: () => void
  animationDuration?: number
}

export const useExitAnimation = ({
  onClose,
  animationDuration = DEFAULT_ANIMATION_DURATION,
}: UseExitAnimationProps) => {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, animationDuration)
  }

  return {
    isClosing,
    handleClose,
  }
}
