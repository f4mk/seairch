import { useCallback, useContext, useEffect, useState } from 'react'

import { STORAGE_KEYS } from '@/consts/keyboard'
import { HEIGHT_DEFAULT, WIDTH_DEFAULT } from '@/consts/visuals'
import { getVisualSettings } from '@/lib/storage/visual'

import { SearchContext } from './context'
import { StreamingContextType, UpdateDimensions } from './types'

export const useStreamingContext = (): StreamingContextType => {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
}

export const useLoadVisualSettings = () => {
  const [dimensions, setDimensions] = useState<UpdateDimensions>({
    width: WIDTH_DEFAULT,
    height: HEIGHT_DEFAULT,
  })

  useEffect(() => {
    const loadVisualSettings = async () => {
      try {
        const visualSettings = await getVisualSettings()
        if (visualSettings) {
          setDimensions({
            width: visualSettings[STORAGE_KEYS.baseWidth],
            height: visualSettings[STORAGE_KEYS.baseHeight],
          })
        } else {
          setDimensions({
            width: WIDTH_DEFAULT,
            height: HEIGHT_DEFAULT,
          })
        }
      } catch (error) {
        console.error('Error loading visual settings:', error)
        setDimensions({
          width: WIDTH_DEFAULT,
          height: HEIGHT_DEFAULT,
        })
      }
    }

    void loadVisualSettings()
  }, [])

  const updateDimensions = useCallback((newDimensions: UpdateDimensions) => {
    setDimensions(newDimensions)
  }, [])

  return { dimensions, updateDimensions }
}

export const useCollapse = (updateDimensions: (dimensions: UpdateDimensions) => void) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const onCollapse = useCallback(
    (modalRef: HTMLDivElement | null) => {
      if (!isCollapsed && modalRef) {
        updateDimensions({
          width: modalRef.clientWidth,
          height: modalRef.clientHeight,
        })
      }
      setIsCollapsed((prev) => !prev)
    },
    [isCollapsed, updateDimensions],
  )

  return {
    isCollapsed,
    onCollapse,
  }
}
