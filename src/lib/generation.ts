import type { Box } from './geometry'
import { createSeededRandom, deriveSubSeed } from './random'
import { createOccupancy, canReserve, reserve } from './occupancy'
import { sortBoxesForPainting } from './depthSort'
import { buildCube, type Structure } from './structures'

export type DensityLevel = 'sparse' | 'balanced' | 'dense'
export type HeightVariationLevel = 'uniform' | 'varied' | 'dramatic'
export type GridSizeLevel = 'small' | 'medium' | 'large'
export type ComplexityLevel = 'minimal' | 'moderate' | 'elaborate'

export interface GenerationParams {
  seed: number
  /** Drives the palette independently of the layout — see "Shuffle Palette". */
  paletteSeed: number
  gridSize: GridSizeLevel
  density: DensityLevel
  heightVariation: HeightVariationLevel
  complexity: ComplexityLevel
}

export interface SceneBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface GeneratedScene {
  params: GenerationParams
  structures: Structure[]
  /** Every box across every structure, pre-sorted for the painter's algorithm. */
  drawList: Box[]
  bounds: SceneBounds
}

const GRID_SIZES: Record<GridSizeLevel, number> = { small: 6, medium: 9, large: 12 }
const DENSITY_FRACTIONS: Record<DensityLevel, number> = { sparse: 0.15, balanced: 0.3, dense: 0.5 }
const HEIGHT_RANGES: Record<HeightVariationLevel, { min: number; max: number }> = {
  uniform: { min: 40, max: 52 },
  varied: { min: 24, max: 72 },
  dramatic: { min: 16, max: 110 },
}

// Multi-cell shapes (added in a later milestone) can't always fit as
// densely as single cells, so placement is best-effort: try a bounded
// number of candidates and accept however many actually fit, rather than
// retrying forever.
const MAX_ATTEMPTS_PER_STRUCTURE = 8

export const DEFAULT_PARAMS: GenerationParams = {
  seed: 12345,
  paletteSeed: 67890,
  gridSize: 'medium',
  density: 'balanced',
  heightVariation: 'varied',
  complexity: 'moderate',
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000)
}

export function generateScene(params: GenerationParams): GeneratedScene {
  const gridSize = GRID_SIZES[params.gridSize]
  const rng = createSeededRandom(deriveSubSeed(params.seed, 'layout'))
  const occupancy = createOccupancy(gridSize)
  const targetCount = Math.max(1, Math.round(gridSize * gridSize * DENSITY_FRACTIONS[params.density]))
  const heightRange = HEIGHT_RANGES[params.heightVariation]
  const maxAttempts = targetCount * MAX_ATTEMPTS_PER_STRUCTURE

  const structures: Structure[] = []
  for (let attempts = 0; structures.length < targetCount && attempts < maxAttempts; attempts++) {
    const origin = { x: Math.floor(rng() * gridSize), y: Math.floor(rng() * gridSize) }
    const structure = buildCube(origin, heightRange, rng)
    if (canReserve(occupancy, structure.footprint)) {
      reserve(occupancy, structure.footprint)
      structures.push(structure)
    }
  }

  const drawList = sortBoxesForPainting(structures.flatMap((structure) => structure.boxes))

  return {
    params,
    structures,
    drawList,
    bounds: { minX: 0, maxX: gridSize, minY: 0, maxY: gridSize },
  }
}
