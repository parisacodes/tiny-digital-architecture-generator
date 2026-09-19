import type { ScreenPoint } from './lib/isometric'
import type { Box } from './lib/geometry'
import { getBoxFaces } from './lib/geometry'
import type { GeneratedScene } from './lib/generation'
import { colorsForStructure, type FaceColors, type PaletteConfig } from './lib/palette'

export type { FaceColors } from './lib/palette'

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

/** Paints the atmospheric dusk sky gradient behind the composition. */
export function paintBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: PaletteConfig['background']
) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, background.from)
  gradient.addColorStop(1, background.to)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

/**
 * Paints an entire generated scene: background gradient, then every box in
 * pre-sorted (back-to-front) order, colored by its owning structure. This
 * is the single paint routine reused by the live canvas and PNG export.
 */
export function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: GeneratedScene,
  palette: PaletteConfig,
  width: number,
  height: number,
  originX: number,
  originY: number
) {
  paintBackground(ctx, width, height, palette.background)

  const colorsByBox = new Map<Box, FaceColors>()
  for (const structure of scene.structures) {
    const colors = colorsForStructure(structure, palette)
    for (const box of structure.boxes) {
      colorsByBox.set(box, colors)
    }
  }

  for (const box of scene.drawList) {
    const colors = colorsByBox.get(box)
    if (colors) drawBox(ctx, box, originX, originY, colors)
  }
}
