import { SceneCanvas } from './components/SceneCanvas'
import { ControlPanel } from './components/ControlPanel'
import { useSceneState } from './state'

function App() {
  const { params, scene, palette, regenerate, shufflePalette, updateParam } = useSceneState()

  return (
    <div className="app-shell">
      <SceneCanvas scene={scene} palette={palette} />
      <ControlPanel
        params={params}
        onRegenerate={regenerate}
        onShufflePalette={shufflePalette}
        onUpdateParam={updateParam}
      />
    </div>
  )
}

export default App
