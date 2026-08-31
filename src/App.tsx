import './App.css'
import { useRef, useEffect } from 'react'

function gridToScreen(gridX: number, gridY:number) {
  const screenX = (gridX - gridY) * (64 / 2)
  const screenY = (gridX + gridY) * (32 / 2)
  return {
    x: screenX, 
    y: screenY}
}

function project(gridX: number, gridY: number, originX: number, originY: number) {
  const p = gridToScreen(gridX, gridY)
  return { x: p.x + originX, y: p.y + originY }
}

function drawCube(ctx: CanvasRenderingContext2D, options:{
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
  }) {
  // Top face of the cube
  ctx.beginPath()
  const topPoint = project(options.gridX, options.gridY, options.originX, options.originY)
  ctx.moveTo(topPoint.x, topPoint.y)
  const rightPoint = project(options.gridX+1, options.gridY, options.originX, options.originY)
  ctx.lineTo(rightPoint.x, rightPoint.y)
  const bottomPoint = project(options.gridX+1, options.gridY+1, options.originX, options.originY)
  ctx.lineTo(bottomPoint.x, bottomPoint.y)
  const leftPoint = project(options.gridX, options.gridY+1, options.originX, options.originY)
  ctx.lineTo(leftPoint.x, leftPoint.y)
  ctx.closePath()
  ctx.fillStyle = options.colors.top
  ctx.fill()

  // Left face of the cube
  ctx.beginPath()
  ctx.moveTo(leftPoint.x, leftPoint.y)
  const bottomLeftPoint = {
    x: leftPoint.x,
    y: leftPoint.y + options.height
  }
  ctx.lineTo(bottomLeftPoint.x, bottomLeftPoint.y)
  const frontBottomPoint = {
    x: bottomPoint.x,
    y: bottomPoint.y + options.height
  }
  ctx.lineTo(frontBottomPoint.x, frontBottomPoint.y)
  ctx.lineTo(bottomPoint.x, bottomPoint.y)
  ctx.closePath()
  ctx.fillStyle = options.colors.left
  ctx.fill()

  // Right face of the cube
  ctx.beginPath()
  ctx.moveTo(bottomPoint.x, bottomPoint.y)
  ctx.lineTo(rightPoint.x, rightPoint.y)
  const bottomRightPoint = {
    x: rightPoint.x,
    y: rightPoint.y + options.height
  }
  ctx.lineTo(bottomRightPoint.x, bottomRightPoint.y)
  ctx.lineTo(frontBottomPoint.x, frontBottomPoint.y)
  ctx.closePath()
  ctx.fillStyle = options.colors.right
  ctx.fill()
}

function generateRandomPositions(count: number, maxGrid:number, randomFunction: () => number) {
  const positions = []
  for (let i = 0; i < count; i++) {
    const randomGridX = Math.floor(randomFunction() * maxGrid)
    const randomGridY = Math.floor(randomFunction() * maxGrid)
    positions.push({
      gridX: randomGridX,
      gridY: randomGridY
    })
  }
    return positions
}

function createSeededRandom(seed: number) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
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
        const height = 40

        const colors = {
          top: '#a0a0a0',
          left: '#222222',
          right: '#636363'}
       
        const randomGenerator = createSeededRandom(seedRef.current)
        const positions = generateRandomPositions(6, 5, randomGenerator)
        positions.forEach((pos) => {
          drawCube(ctx, {
            ...pos,
            originX,
            originY,
            height,
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
