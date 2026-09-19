import type { ScreenPoint } from './lib/isometric'
import type { Box } from './lib/geometry'
import { getBoxFaces } from './lib/geometry'
import type { GeneratedScene, SceneBounds } from './lib/generation'
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

/** Paints every box in the scene's pre-sorted (back-to-front) order, colored by its owning structure. */
export function drawStructures(
  ctx: CanvasRenderingContext2D,
  scene: GeneratedScene,
  palette: PaletteConfig,
  originX: number,
  originY: number
) {
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

export interface SceneFit {
  scale: number
  originX: number
  originY: number
}

/** Computes the uniform scale + origin offset that centers and fits `bounds` within `width`x`height`. */
export function computeSceneFit(bounds: SceneBounds, width: number, height: number, padding = 0.9): SceneFit {
  const sceneWidth = Math.max(bounds.maxX - bounds.minX, 1)
  const sceneHeight = Math.max(bounds.maxY - bounds.minY, 1)
  const scale = Math.min(width / sceneWidth, height / sceneHeight) * padding

  return {
    scale,
    originX: -(bounds.minX + bounds.maxX) / 2,
    originY: -(bounds.minY + bounds.maxY) / 2,
  }
}

/**
 * Paints an entire generated scene into a `width`x`height` CSS-pixel area:
 * background gradient at full size, then the composition centered and
 * scaled to fit. Assumes `ctx`'s transform already accounts for device
 * pixel ratio (see configureCanvasForDisplay) — this only handles fitting
 * the scene itself, so the same call works for the live canvas and for
 * PNG export.
 */
export function paintScene(
  ctx: CanvasRenderingContext2D,
  scene: GeneratedScene,
  palette: PaletteConfig,
  width: number,
  height: number
) {
  paintBackground(ctx, width, height, palette.background)

  const fit = computeSceneFit(scene.bounds, width, height)
  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.scale(fit.scale, fit.scale)
  drawStructures(ctx, scene, palette, fit.originX, fit.originY)
  ctx.restore()
}

/** Sets a canvas's backing resolution for its device pixel ratio while keeping its CSS size fixed. */
export function configureCanvasForDisplay(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio = 1
): CanvasRenderingContext2D {
  canvas.width = Math.max(1, Math.round(cssWidth * devicePixelRatio))
  canvas.height = Math.max(1, Math.round(cssHeight * devicePixelRatio))
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
  return ctx
}
