import './App.css'
import { useRef, useEffect } from 'react'
import { createSeededRandom } from './lib/random'
import type { Box } from './lib/geometry'
import { drawBox } from './render'

function generateRandomPositions(
  count: number,
  maxGrid: number,
  randomFunction: () => number
) {
  const positions = []
  const usedPositions = new Set<string>()

  for (let i = 0; i < count; i++) {
    let randomGridX
    let randomGridY
    let key

    do {
      randomGridX = Math.floor(randomFunction() * maxGrid)
      randomGridY = Math.floor(randomFunction() * maxGrid)
      key = `${randomGridX},${randomGridY}`
    } while (usedPositions.has(key))

    usedPositions.add(key)

    const randomHeight =
      (Math.floor(randomFunction() * 4) + 1) * 20

    positions.push({
      gridX: randomGridX,
      gridY: randomGridY,
      height: randomHeight
    })
  }

  return positions
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const seedRef = useRef(12345)
  function handleRegenerate() {
    seedRef.current = seedRef.current + 1
    renderScene()
  }
  function renderScene() {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, 400, 400)
        const originX = 200
        const originY = 100

        const colors = {
          top: '#a0a0a0',
          left: '#222222',
          right: '#636363'}
       
        const randomGenerator = createSeededRandom(seedRef.current)
        const positions = generateRandomPositions(6, 5, randomGenerator)
        positions.sort((cubeA, cubeB) => (cubeA.gridX + cubeA.gridY) - (cubeB.gridX + cubeB.gridY))
        positions.forEach((pos) => {
          const box: Box = {
            footprint: { x: pos.gridX, y: pos.gridY, width: 1, depth: 1 },
            elevation: 0,
            height: pos.height
          }
          drawBox(ctx, box, originX, originY, colors)
        })

        }
      }
  }
  useEffect(()=> {
    renderScene()
    }, []
  )


  return(
  <div>
    <canvas ref={canvasRef} width={400} height={400} style={{ border: '1px solid black' }}/>
    <button onClick={handleRegenerate}>Regenerate</button>
  </div>
  )

} 

export default App
