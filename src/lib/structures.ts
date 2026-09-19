import type { Box, GridCoord, GridFootprint } from './geometry'
import type { RandomFn } from './random'

// Only 'cube' is built for now — column/wall/staircase/arch are added in a
// later milestone once the core generation pipeline is proven out.
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
