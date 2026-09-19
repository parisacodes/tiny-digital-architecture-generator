import './App.css'
import { useRef, useEffect } from 'react'
import { DEFAULT_PARAMS, generateScene } from './lib/generation'
import { derivePalette } from './lib/palette'
import { drawScene } from './render'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const seedRef = useRef(DEFAULT_PARAMS.seed)

  function renderScene() {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    const width = 400
    const height = 400
    const params = { ...DEFAULT_PARAMS, seed: seedRef.current }
    const scene = generateScene(params)
    const palette = derivePalette(params.paletteSeed)

    drawScene(ctx, scene, palette, width, height, width / 2, height / 2.5)
  }

  function handleRegenerate() {
    seedRef.current += 1
    renderScene()
  }

  useEffect(() => {
    renderScene()
  }, [])

  return (
    <div>
      <canvas ref={canvasRef} width={400} height={400} style={{ border: '1px solid black' }} />
      <button onClick={handleRegenerate}>Regenerate</button>
    </div>
  )
}

export default App
