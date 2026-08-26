import './App.css'
import { useRef, useEffect } from 'react'

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(()=> {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      console.log(ctx)
    }
    }, []
  )
  return(
  <canvas ref={canvasRef} width={400} height={400}/>
  )

} 

export default App
