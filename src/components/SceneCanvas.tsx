import { useEffect, useRef } from 'react'
import type { GeneratedScene } from '../lib/generation'
import type { PaletteConfig } from '../lib/palette'
import { configureCanvasForDisplay, paintScene } from '../render'

interface SceneCanvasProps {
  scene: GeneratedScene
  palette: PaletteConfig
}

export function SceneCanvas({ scene, palette }: SceneCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sizeRef = useRef({ width: 0, height: 0 })
  // Read via a ref inside repaint (not the props directly) so the
  // ResizeObserver callback — subscribed once on mount — always paints the
  // latest scene/palette instead of whatever was current when it subscribed.
  const latestRef = useRef({ scene, palette })
  latestRef.current = { scene, palette }

  function repaint() {
    const canvas = canvasRef.current
    const { width, height } = sizeRef.current
    if (!canvas || width === 0 || height === 0) return

    const dpr = window.devicePixelRatio || 1
    const ctx = configureCanvasForDisplay(canvas, width, height, dpr)
    const { scene: currentScene, palette: currentPalette } = latestRef.current
    paintScene(ctx, currentScene, currentPalette, width, height)
  }

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      sizeRef.current = { width: entry.contentRect.width, height: entry.contentRect.height }
      repaint()
    })
    observer.observe(wrapper)
    return () => observer.disconnect()
    // Intentionally empty: repaint() reads current scene/palette via latestRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    repaint()
  }, [scene, palette])

  return (
    <div ref={wrapperRef} className="scene-canvas-wrapper">
      <canvas ref={canvasRef} className="scene-canvas" />
    </div>
  )
}
