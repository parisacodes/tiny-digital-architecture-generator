import type { Box, GridCoord, GridFootprint } from './geometry'
import type { RandomFn } from './random'

export type StructureKind = 'cube' | 'column' | 'wall' | 'staircase' | 'arch'

/** A named architectural form: one or more boxes sharing a bounding footprint. */
export interface Structure {
  id: string
  kind: StructureKind
  /** Bounding footprint — the union of all boxes' footprints, used for occupancy. */
  footprint: GridFootprint
  /** Elevation-ascending. */
  boxes: Box[]
  /** Deterministic per-structure input for palette color jitter. */
  colorSeed: number
}

export interface HeightRange {
  min: number
  max: number
}

function randomHeight(rng: RandomFn, range: HeightRange): number {
  return range.min + rng() * (range.max - range.min)
}

function scaleRange(range: HeightRange, min: number, max: number): HeightRange {
  return { min: range.min * min, max: range.max * max }
}

export function buildCube(origin: GridCoord, heightRange: HeightRange, rng: RandomFn): Structure {
  const footprint: GridFootprint = { x: origin.x, y: origin.y, width: 1, depth: 1 }
  const height = randomHeight(rng, heightRange)
  return {
    id: `cube-${origin.x}-${origin.y}`,
    kind: 'cube',
    footprint,
    boxes: [{ footprint, elevation: 0, height }],
    colorSeed: rng(),
  }
}

const COLUMN_THICKNESS = 0.32

/** A slender, tall pillar centered within its cell — reserves the full cell even though it only visually occupies a fraction of it. */
export function buildColumn(origin: GridCoord, heightRange: HeightRange, rng: RandomFn): Structure {
  const offset = (1 - COLUMN_THICKNESS) / 2
  const footprint: GridFootprint = {
    x: origin.x + offset,
    y: origin.y + offset,
    width: COLUMN_THICKNESS,
    depth: COLUMN_THICKNESS,
  }
  const height = randomHeight(rng, scaleRange(heightRange, 1.2, 1.6))
  return {
    id: `column-${origin.x}-${origin.y}`,
    kind: 'column',
    footprint,
    boxes: [{ footprint, elevation: 0, height }],
    colorSeed: rng(),
  }
}

const WALL_THICKNESS = 0.22
const WALL_MIN_LENGTH = 2
const WALL_MAX_LENGTH = 4

/** A thin, elongated segment (2-4 cells) along a randomly chosen axis. */
export function buildWall(origin: GridCoord, heightRange: HeightRange, rng: RandomFn): Structure {
  const horizontal = rng() < 0.5
  const length = WALL_MIN_LENGTH + Math.floor(rng() * (WALL_MAX_LENGTH - WALL_MIN_LENGTH + 1))
  const offset = (1 - WALL_THICKNESS) / 2

  const footprint: GridFootprint = horizontal
    ? { x: origin.x, y: origin.y + offset, width: length, depth: WALL_THICKNESS }
    : { x: origin.x + offset, y: origin.y, width: WALL_THICKNESS, depth: length }

  const height = randomHeight(rng, scaleRange(heightRange, 0.6, 0.75))
  return {
    id: `wall-${origin.x}-${origin.y}`,
    kind: 'wall',
    footprint,
    boxes: [{ footprint, elevation: 0, height }],
    colorSeed: rng(),
  }
}

const STAIRCASE_MIN_STEPS = 3
const STAIRCASE_MAX_STEPS = 5

/** A sequence of steps climbing forward one cell at a time, each riser both its elevation gain and its own height. */
export function buildStaircase(origin: GridCoord, heightRange: HeightRange, rng: RandomFn): Structure {
  const steps = STAIRCASE_MIN_STEPS + Math.floor(rng() * (STAIRCASE_MAX_STEPS - STAIRCASE_MIN_STEPS + 1))
  const riser = randomHeight(rng, scaleRange(heightRange, 0.35, 0.55))
  const horizontal = rng() < 0.5

  const boxes: Box[] = []
  for (let i = 0; i < steps; i++) {
    const footprint: GridFootprint = horizontal
      ? { x: origin.x + i, y: origin.y, width: 1, depth: 1 }
      : { x: origin.x, y: origin.y + i, width: 1, depth: 1 }
    boxes.push({ footprint, elevation: i * riser, height: riser })
  }

  const footprint: GridFootprint = horizontal
    ? { x: origin.x, y: origin.y, width: steps, depth: 1 }
    : { x: origin.x, y: origin.y, width: 1, depth: steps }

  return {
    id: `staircase-${origin.x}-${origin.y}`,
    kind: 'staircase',
    footprint,
    boxes,
    colorSeed: rng(),
  }
}

/** Two pillars with a deliberate one-cell gap between them, spanned by a slim lintel resting on top. */
export function buildArch(origin: GridCoord, heightRange: HeightRange, rng: RandomFn): Structure {
  const pillarHeight = randomHeight(rng, scaleRange(heightRange, 0.9, 1.1))
  const lintelThickness = Math.max(6, pillarHeight * 0.16)
  const horizontal = rng() < 0.5

  const pillarA: GridFootprint = { x: origin.x, y: origin.y, width: 1, depth: 1 }
  const pillarB: GridFootprint = horizontal
    ? { x: origin.x + 2, y: origin.y, width: 1, depth: 1 }
    : { x: origin.x, y: origin.y + 2, width: 1, depth: 1 }
  // Spans all 3 cells, including the gap the pillars leave open, so nothing
  // else can be placed underneath the opening.
  const lintel: GridFootprint = horizontal
    ? { x: origin.x, y: origin.y, width: 3, depth: 1 }
    : { x: origin.x, y: origin.y, width: 1, depth: 3 }

  return {
    id: `arch-${origin.x}-${origin.y}`,
    kind: 'arch',
    footprint: lintel,
    boxes: [
      { footprint: pillarA, elevation: 0, height: pillarHeight },
      { footprint: pillarB, elevation: 0, height: pillarHeight },
      { footprint: lintel, elevation: pillarHeight, height: lintelThickness },
    ],
    colorSeed: rng(),
  }
}
