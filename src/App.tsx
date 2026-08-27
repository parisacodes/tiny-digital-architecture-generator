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
  }) 
  {
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

    console.log(ctx)
  }

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(()=> {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        drawCube(ctx, {
          gridX: 0,
          gridY: 0,
          originX: 200,
          originY: 100,
          height: 40,
          colors: {
            top: '#a0a0a0',
            left: '#222222',
            right: '#636363'
          }
        })
        drawCube(ctx, {
          gridX: 1,
          gridY: 0,
          originX: 200,
          originY: 100,
          height: 40,
          colors: {
            top: '#a0a0a0',
            left: '#222222',
            right: '#636363'
          }
        })
      }
    }
    }, []
  )


  return(
  <canvas ref={canvasRef} width={400} height={400} style={{ border: '1px solid black' }}/>
  )

} 

export default App
