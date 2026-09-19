import { useMemo, useState } from 'react'
import { DEFAULT_PARAMS, generateScene } from './lib/generation'
import { derivePalette } from './lib/palette'
import { SceneCanvas } from './components/SceneCanvas'

function App() {
  const [seed, setSeed] = useState(DEFAULT_PARAMS.seed)

  const scene = useMemo(() => generateScene({ ...DEFAULT_PARAMS, seed }), [seed])
  const palette = useMemo(() => derivePalette(DEFAULT_PARAMS.paletteSeed), [])

  function handleRegenerate() {
    setSeed((current) => current + 1)
  }

  return (
    <div className="app-shell">
      <SceneCanvas scene={scene} palette={palette} />
      <aside className="control-panel">
        <button onClick={handleRegenerate}>Regenerate</button>
      </aside>
    </div>
  )
}

export default App
