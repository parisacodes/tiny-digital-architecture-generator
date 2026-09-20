import { SceneCanvas } from './components/SceneCanvas'
import { ControlPanel } from './components/ControlPanel'
import { useSceneState } from './state'
import { exportSceneAsPng } from './exportPng'

function App() {
  const { params, scene, palette, regenerate, shufflePalette, updateParam } = useSceneState()

  function handleExport() {
    exportSceneAsPng(scene, palette, `tiny-digital-architecture-${params.seed}-${params.paletteSeed}.png`)
  }

  return (
    <div className="app-shell">
      <SceneCanvas scene={scene} palette={palette} />
      <ControlPanel
        params={params}
        onRegenerate={regenerate}
        onShufflePalette={shufflePalette}
        onExport={handleExport}
        onUpdateParam={updateParam}
      />
    </div>
  )
}

export default App
