import type { GeneratedScene } from './lib/generation'
import type { PaletteConfig } from './lib/palette'
import { configureCanvasForDisplay, paintScene } from './render'

// Fixed supersample factor, independent of the viewing device's DPR, so the
// download is consistently crisp regardless of what screen it was made on.
const EXPORT_SUPERSAMPLE = 2

/**
 * Renders the scene onto a detached offscreen canvas (never attached to the
 * DOM) and downloads it as a PNG. Because the canvas contains nothing but
 * the composition, there's no UI chrome in the export by construction —
 * nothing to crop out after the fact.
 */
export function exportSceneAsPng(scene: GeneratedScene, palette: PaletteConfig, filename: string) {
  const width = Math.max(1, scene.bounds.maxX - scene.bounds.minX)
  const height = Math.max(1, scene.bounds.maxY - scene.bounds.minY)

  const canvas = document.createElement('canvas')
  const ctx = configureCanvasForDisplay(canvas, width, height, EXPORT_SUPERSAMPLE)
  paintScene(ctx, scene, palette, width, height)

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}
