import type { Box } from './geometry'
import { getBoxFaces } from './geometry'
import { createSeededRandom, deriveSubSeed, type RandomFn } from './random'
import { createOccupancy, canReserve, reserve } from './occupancy'
import { sortBoxesForPainting } from './depthSort'
import {
  buildArch,
  buildColumn,
  buildCube,
  buildStaircase,
  buildWall,
  type HeightRange,
  type Structure,
  type StructureKind,
} from './structures'

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

/** The scene's natural extent in unscaled isometric screen-space units (origin 0,0), for fit-to-container sizing and export. */
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

// Multi-cell shapes can't always fit as densely as single cells, so
// placement is best-effort: try a bounded number of candidates and accept
// however many actually fit, rather than retrying forever.
const MAX_ATTEMPTS_PER_STRUCTURE = 15

type RecipeBuilder = (origin: { x: number; y: number }, heightRange: HeightRange, rng: RandomFn) => Structure

const RECIPES: Record<StructureKind, RecipeBuilder> = {
  cube: buildCube,
  column: buildColumn,
  wall: buildWall,
  staircase: buildStaircase,
  arch: buildArch,
}

// Arches (the busiest, most eye-catching form) only become reachable at
// higher complexity, so compositions stay coherent rather than chaotic as
// complexity increases.
const COMPLEXITY_WEIGHTS: Record<ComplexityLevel, Partial<Record<StructureKind, number>>> = {
  minimal: { cube: 0.6, column: 0.4 },
  moderate: { cube: 0.4, column: 0.25, wall: 0.2, staircase: 0.15 },
  elaborate: { cube: 0.25, column: 0.2, wall: 0.15, staircase: 0.2, arch: 0.2 },
}

function pickKind(rng: RandomFn, complexity: ComplexityLevel): StructureKind {
  const weights = Object.entries(COMPLEXITY_WEIGHTS[complexity]) as [StructureKind, number][]
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = rng() * total
  for (const [kind, weight] of weights) {
    if (roll < weight) return kind
    roll -= weight
  }
  return weights[weights.length - 1][0]
}

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
    const kind = pickKind(rng, params.complexity)
    const structure = RECIPES[kind](origin, heightRange, rng)
    if (canReserve(occupancy, structure.footprint)) {
      reserve(occupancy, structure.footprint)
      structures.push(structure)
    }
  }

  const boxes = structures.flatMap((structure) => structure.boxes)
  const drawList = sortBoxesForPainting(boxes)

  return {
    params,
    structures,
    drawList,
    bounds: computeSceneBounds(boxes, gridSize),
  }
}

function computeSceneBounds(boxes: Box[], gridSize: number): SceneBounds {
  if (boxes.length === 0) {
    const half = (gridSize * 64) / 2
    return { minX: -half, maxX: half, minY: 0, maxY: gridSize * 32 }
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const box of boxes) {
    const faces = getBoxFaces(box, 0, 0)
    for (const face of [faces.top, faces.left, faces.right]) {
      for (const point of face) {
        if (point.x < minX) minX = point.x
        if (point.x > maxX) maxX = point.x
        if (point.y < minY) minY = point.y
        if (point.y > maxY) maxY = point.y
      }
    }
  }

  return { minX, maxX, minY, maxY }
}
