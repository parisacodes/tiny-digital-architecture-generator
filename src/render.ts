import type { ScreenPoint } from './lib/isometric'
import type { Box } from './lib/geometry'
import { getBoxFaces } from './lib/geometry'

export interface FaceColors {
  top: string
  left: string
  right: string
}

function fillPolygon(ctx: CanvasRenderingContext2D, points: ScreenPoint[], color: string) {
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
}

/** Paints a single box's three visible faces onto the canvas. */
export function drawBox(
  ctx: CanvasRenderingContext2D,
  box: Box,
  originX: number,
  originY: number,
  colors: FaceColors
) {
  const faces = getBoxFaces(box, originX, originY)
  fillPolygon(ctx, faces.top, colors.top)
  fillPolygon(ctx, faces.left, colors.left)
  fillPolygon(ctx, faces.right, colors.right)
}
