import './App.css'
import { useRef, useEffect } from 'react'
import { DEFAULT_PARAMS, generateScene } from './lib/generation'
import { drawBox, type FaceColors } from './render'

const PLACEHOLDER_COLORS: FaceColors = {
  top: '#a0a0a0',
  left: '#222222',
  right: '#636363',
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const seedRef = useRef(DEFAULT_PARAMS.seed)

  function renderScene() {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, 400, 400)
    const originX = 200
    const originY = 150

    const scene = generateScene({ ...DEFAULT_PARAMS, seed: seedRef.current })
    scene.drawList.forEach((box) => {
      drawBox(ctx, box, originX, originY, PLACEHOLDER_COLORS)
    })
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
