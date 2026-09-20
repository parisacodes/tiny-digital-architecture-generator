import { useState } from 'react'
import type {
  ComplexityLevel,
  DensityLevel,
  GenerationParams,
  GridSizeLevel,
  HeightVariationLevel,
} from '../lib/generation'

interface ControlPanelProps {
  params: GenerationParams
  onRegenerate: () => void
  onShufflePalette: () => void
  onExport: () => void
  onUpdateParam: <K extends keyof GenerationParams>(key: K, value: GenerationParams[K]) => void
}

interface StepOption<T extends string> {
  value: T
  label: string
}

const GRID_SIZE_OPTIONS: StepOption<GridSizeLevel>[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]
const DENSITY_OPTIONS: StepOption<DensityLevel>[] = [
  { value: 'sparse', label: 'Sparse' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'dense', label: 'Dense' },
]
const HEIGHT_VARIATION_OPTIONS: StepOption<HeightVariationLevel>[] = [
  { value: 'uniform', label: 'Uniform' },
  { value: 'varied', label: 'Varied' },
  { value: 'dramatic', label: 'Dramatic' },
]
const COMPLEXITY_OPTIONS: StepOption<ComplexityLevel>[] = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'elaborate', label: 'Elaborate' },
]

function StepGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: StepOption<T>[]
  onChange: (value: T) => void
}) {
  return (
    <fieldset className="step-group">
      <legend>{label}</legend>
      <div className="step-group-options">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={option.value === value ? 'step-option step-option-active' : 'step-option'}
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function SeedField({ seed, onChangeSeed }: { seed: number; onChangeSeed: (seed: number) => void }) {
  // Reset the draft whenever `seed` changes from outside (Regenerate, a
  // shared URL loading, etc.) by adjusting state during render instead of
  // an effect — avoids an extra render pass just to sync a prop into state.
  const [lastSeed, setLastSeed] = useState(seed)
  const [draft, setDraft] = useState(String(seed))
  if (seed !== lastSeed) {
    setLastSeed(seed)
    setDraft(String(seed))
  }

  const [copied, setCopied] = useState(false)

  function commit() {
    const parsed = Number(draft)
    if (Number.isFinite(parsed) && draft.trim() !== '') {
      onChangeSeed(Math.trunc(parsed))
    } else {
      setDraft(String(seed))
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(String(seed))
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // Clipboard access can be denied by the browser; the input's own
      // text remains selectable/copyable by hand as a fallback.
    }
  }

  return (
    <div className="seed-field">
      <label htmlFor="seed-input">Seed</label>
      <div className="seed-field-row">
        <input
          id="seed-input"
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
          }}
        />
        <button type="button" onClick={handleCopy} aria-label="Copy seed">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export function ControlPanel({
  params,
  onRegenerate,
  onShufflePalette,
  onExport,
  onUpdateParam,
}: ControlPanelProps) {
  return (
    <aside className="control-panel">
      <div className="panel-header">
        <h1>Tiny Digital Architecture</h1>
        <p>A procedurally generated isometric composition.</p>
      </div>

      <SeedField seed={params.seed} onChangeSeed={(seed) => onUpdateParam('seed', seed)} />

      <div className="panel-actions">
        <button type="button" className="primary-action" onClick={onRegenerate}>
          Regenerate
        </button>
        <button type="button" onClick={onShufflePalette}>
          Shuffle Palette
        </button>
      </div>

      <StepGroup
        label="Grid size"
        value={params.gridSize}
        options={GRID_SIZE_OPTIONS}
        onChange={(value) => onUpdateParam('gridSize', value)}
      />
      <StepGroup
        label="Density"
        value={params.density}
        options={DENSITY_OPTIONS}
        onChange={(value) => onUpdateParam('density', value)}
      />
      <StepGroup
        label="Height variation"
        value={params.heightVariation}
        options={HEIGHT_VARIATION_OPTIONS}
        onChange={(value) => onUpdateParam('heightVariation', value)}
      />
      <StepGroup
        label="Complexity"
        value={params.complexity}
        options={COMPLEXITY_OPTIONS}
        onChange={(value) => onUpdateParam('complexity', value)}
      />

      <button type="button" onClick={onExport}>
        Export PNG
      </button>
    </aside>
  )
}
