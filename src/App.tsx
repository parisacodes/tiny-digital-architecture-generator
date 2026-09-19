import './App.css'
import { useRef, useEffect } from 'react'
import { project } from './lib/isometric'
import { createSeededRandom } from './lib/random'

function drawCube(
  ctx: CanvasRenderingContext2D,
  options: {
    gridX: number
    gridY: number
    originX: number
    originY: number
    height: number
    colors: {
      top: string
      left: string
      right: string
    }
  }
) {
  // Ground/base points
  const baseBackPoint = project(
    options.gridX,
    options.gridY,
    options.originX,
    options.originY
  )

  const baseRightPoint = project(
    options.gridX + 1,
    options.gridY,
    options.originX,
    options.originY
  )

  const baseFrontPoint = project(
    options.gridX + 1,
    options.gridY + 1,
    options.originX,
    options.originY
  )

  const baseLeftPoint = project(
    options.gridX,
    options.gridY + 1,
    options.originX,
    options.originY
  )

  // Roof points = corresponding base points moved upward by height
  const roofBackPoint = {
    x: baseBackPoint.x,
    y: baseBackPoint.y - options.height
  }

  const roofRightPoint = {
    x: baseRightPoint.x,
    y: baseRightPoint.y - options.height
  }

  const roofFrontPoint = {
    x: baseFrontPoint.x,
    y: baseFrontPoint.y - options.height
  }

  const roofLeftPoint = {
    x: baseLeftPoint.x,
    y: baseLeftPoint.y - options.height
  }

  // Top face
  ctx.beginPath()
  ctx.moveTo(roofBackPoint.x, roofBackPoint.y)
  ctx.lineTo(roofRightPoint.x, roofRightPoint.y)
  ctx.lineTo(roofFrontPoint.x, roofFrontPoint.y)
  ctx.lineTo(roofLeftPoint.x, roofLeftPoint.y)
  ctx.closePath()
  ctx.fillStyle = options.colors.top
  ctx.fill()

  // Left face
  ctx.beginPath()
  ctx.moveTo(roofLeftPoint.x, roofLeftPoint.y)
  ctx.lineTo(baseLeftPoint.x, baseLeftPoint.y)
  ctx.lineTo(baseFrontPoint.x, baseFrontPoint.y)
  ctx.lineTo(roofFrontPoint.x, roofFrontPoint.y)
  ctx.closePath()
  ctx.fillStyle = options.colors.left
  ctx.fill()

  // Right face
  ctx.beginPath()
  ctx.moveTo(roofFrontPoint.x, roofFrontPoint.y)
  ctx.lineTo(roofRightPoint.x, roofRightPoint.y)
  ctx.lineTo(baseRightPoint.x, baseRightPoint.y)
  ctx.lineTo(baseFrontPoint.x, baseFrontPoint.y)
  ctx.closePath()
  ctx.fillStyle = options.colors.right
  ctx.fill()
}

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
          drawCube(ctx, {
            ...pos,
            originX,
            originY,
            colors
          })
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
