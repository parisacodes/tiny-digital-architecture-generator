export const TILE_WIDTH = 64
export const TILE_HEIGHT = 32

export interface ScreenPoint {
  x: number
  y: number
}

export function gridToScreen(gridX: number, gridY: number): ScreenPoint {
  const screenX = (gridX - gridY) * (TILE_WIDTH / 2)
  const screenY = (gridX + gridY) * (TILE_HEIGHT / 2)
  return { x: screenX, y: screenY }
}

export function project(
  gridX: number,
  gridY: number,
  originX: number,
  originY: number
): ScreenPoint {
  const p = gridToScreen(gridX, gridY)
  return { x: p.x + originX, y: p.y + originY }
}
