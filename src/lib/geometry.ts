import { project, type ScreenPoint } from './isometric'

export interface GridCoord {
  x: number
  y: number
}

/** A rectangular footprint on the ground grid, in grid units. */
export interface GridFootprint {
  x: number
  y: number
  width: number
  depth: number
}

/**
 * A single base-anchored rectangular volume: its base sits `elevation`
 * grid-height-units above the ground plane, and it extends upward from
 * there by `height`. Structures compose one or more of these.
 */
export interface Box {
  footprint: GridFootprint
  elevation: number
  height: number
}

export interface BoxFaces {
  top: ScreenPoint[]
  left: ScreenPoint[]
  right: ScreenPoint[]
}

function up(point: ScreenPoint, amount: number): ScreenPoint {
  return { x: point.x, y: point.y - amount }
}

/**
 * Computes the three visible face polygons (top, left, right) of a box in
 * screen space. The footprint corners are projected at ground level, then
 * raised by `elevation` to form the box's base, and raised again by
 * `height` to form its roof — base-anchored so that sorting boxes by
 * ground-footprint depth (see lib/depthSort.ts) stays correct for any mix
 * of heights.
 */
export function getBoxFaces(box: Box, originX: number, originY: number): BoxFaces {
  const { footprint, elevation, height } = box

  const groundBack = project(footprint.x, footprint.y, originX, originY)
  const groundRight = project(footprint.x + footprint.width, footprint.y, originX, originY)
  const groundFront = project(
    footprint.x + footprint.width,
    footprint.y + footprint.depth,
    originX,
    originY
  )
  const groundLeft = project(footprint.x, footprint.y + footprint.depth, originX, originY)

  const baseBack = up(groundBack, elevation)
  const baseRight = up(groundRight, elevation)
  const baseFront = up(groundFront, elevation)
  const baseLeft = up(groundLeft, elevation)

  const roofBack = up(baseBack, height)
  const roofRight = up(baseRight, height)
  const roofFront = up(baseFront, height)
  const roofLeft = up(baseLeft, height)

  return {
    top: [roofBack, roofRight, roofFront, roofLeft],
    left: [roofLeft, baseLeft, baseFront, roofFront],
    right: [roofFront, roofRight, baseRight, baseFront],
  }
}
