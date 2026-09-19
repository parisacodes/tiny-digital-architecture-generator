import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_PARAMS, generateScene, randomSeed, type GenerationParams } from './lib/generation'
import { derivePalette } from './lib/palette'

const GRID_SIZE_LEVELS = new Set(['small', 'medium', 'large'])
const DENSITY_LEVELS = new Set(['sparse', 'balanced', 'dense'])
const HEIGHT_VARIATION_LEVELS = new Set(['uniform', 'varied', 'dramatic'])
const COMPLEXITY_LEVELS = new Set(['minimal', 'moderate', 'elaborate'])

export function paramsToSearchParams(params: GenerationParams): URLSearchParams {
  const search = new URLSearchParams()
  search.set('seed', String(params.seed))
  search.set('paletteSeed', String(params.paletteSeed))
  search.set('gridSize', params.gridSize)
  search.set('density', params.density)
  search.set('heightVariation', params.heightVariation)
  search.set('complexity', params.complexity)
  return search
}

function parseSeed(value: string | null, fallback: number): number {
  if (value === null) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseLevel<T extends string>(value: string | null, allowed: Set<string>, fallback: T): T {
  return value !== null && allowed.has(value) ? (value as T) : fallback
}

/** Parses URL search params into GenerationParams, falling back to `defaults` field-by-field for anything missing or invalid — never throws. */
export function searchParamsToParams(search: URLSearchParams, defaults: GenerationParams): GenerationParams {
  return {
    seed: parseSeed(search.get('seed'), defaults.seed),
    paletteSeed: parseSeed(search.get('paletteSeed'), defaults.paletteSeed),
    gridSize: parseLevel(search.get('gridSize'), GRID_SIZE_LEVELS, defaults.gridSize),
    density: parseLevel(search.get('density'), DENSITY_LEVELS, defaults.density),
    heightVariation: parseLevel(search.get('heightVariation'), HEIGHT_VARIATION_LEVELS, defaults.heightVariation),
    complexity: parseLevel(search.get('complexity'), COMPLEXITY_LEVELS, defaults.complexity),
  }
}

/**
 * Owns GenerationParams, keeps them synced to the URL (so a composition is
 * shareable via link) and derives the scene/palette from them.
 */
export function useSceneState() {
  const [params, setParams] = useState<GenerationParams>(() =>
    searchParamsToParams(new URLSearchParams(window.location.search), DEFAULT_PARAMS)
  )

  useEffect(() => {
    const search = paramsToSearchParams(params)
    // replaceState (not pushState): dragging a control shouldn't spam
    // browser back-history — the URL just needs to reflect the current
    // composition so it can be copied and shared.
    window.history.replaceState(null, '', `${window.location.pathname}?${search.toString()}`)
  }, [params])

  const scene = useMemo(() => generateScene(params), [params])
  const palette = useMemo(() => derivePalette(params.paletteSeed), [params.paletteSeed])

  const regenerate = useCallback(() => {
    setParams((current) => ({ ...current, seed: randomSeed(), paletteSeed: randomSeed() }))
  }, [])

  const shufflePalette = useCallback(() => {
    setParams((current) => ({ ...current, paletteSeed: randomSeed() }))
  }, [])

  const updateParam = useCallback(<K extends keyof GenerationParams>(key: K, value: GenerationParams[K]) => {
    setParams((current) => ({ ...current, [key]: value }))
  }, [])

  return { params, scene, palette, regenerate, shufflePalette, updateParam }
}
