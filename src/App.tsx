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

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(()=> {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        // Top face of the cube
        ctx.beginPath()
        const point1 = project(0, 0, 200, 100) //top
        ctx.moveTo(point1.x, point1.y)
        const point2 = project(1, 0, 200, 100) //right
        ctx.lineTo(point2.x, point2.y)
        const point3 = project(1, 1, 200, 100) //bottom
        ctx.lineTo(point3.x, point3.y)
        const point4 = project(0, 1, 200, 100) //left
        ctx.lineTo(point4.x, point4.y)
        ctx.closePath()
        ctx.fillStyle = '#000000'
        ctx.fill()

        // Left face of the cube
        ctx.beginPath()
        ctx.moveTo(point4.x, point4.y)
        const point5 = {
          x: point4.x,
          y: point4.y + 40
        }
        ctx.lineTo(point5.x, point5.y)
        const point6 = {
          x: point3.x,
          y: point3.y + 40
        }
        ctx.lineTo(point6.x, point6.y)
        ctx.lineTo(point3.x, point3.y)
        ctx.closePath()
        ctx.fillStyle = '#a0a0a0'
        ctx.fill()

        // Right face of the cube
        ctx.beginPath()
        ctx.moveTo(point3.x, point3.y)
        ctx.lineTo(point2.x, point2.y)
        const point7 = {
          x: point2.x,
          y: point2.y + 40
        }
        ctx.lineTo(point7.x, point7.y)
        ctx.lineTo(point6.x, point6.y)
        ctx.closePath()
        ctx.fillStyle = '#636363'
        ctx.fill()

        console.log(ctx)
      }
    }
    }, []
  )


  return(
  <canvas ref={canvasRef} width={400} height={400} style={{ border: '1px solid black' }}/>
  )

} 

export default App
