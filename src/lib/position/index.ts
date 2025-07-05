import { CalculatedPosition, Dimensions, Position } from './types'

export const calculateModalPosition = (
  position: Position,
  dimensions: Dimensions,
): CalculatedPosition => {
  if (position.x !== null && position.y !== null) {
    return { x: position.x, y: position.y }
  }

  return {
    x: (window.innerWidth - (dimensions.width || 0)) / 2,
    y: (window.innerHeight - (dimensions.height || 0)) / 2,
  }
}
