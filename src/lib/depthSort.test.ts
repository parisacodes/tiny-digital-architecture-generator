import { describe, expect, it } from 'vitest'
import type { Box } from './geometry'
import { sortBoxesForPainting } from './depthSort'

function box(x: number, y: number, width: number, depth: number, elevation: number, id: string): Box & {
  id: string
} {
  return { id, footprint: { x, y, width, depth }, elevation, height: 10 }
}

describe('sortBoxesForPainting', () => {
  it('orders disjoint footprints back-to-front by grid depth', () => {
    const near = box(3, 3, 1, 1, 0, 'near')
    const far = box(0, 0, 1, 1, 0, 'far')
    const mid = box(1, 1, 1, 1, 0, 'mid')

    const sorted = sortBoxesForPainting([near, far, mid])

    expect(sorted.map((b) => (b as typeof mid).id)).toEqual(['far', 'mid', 'near'])
  })

  it('resolves an arch-like pillar/lintel tie by elevation, lintel drawn last', () => {
    // Pillars at (0,0) and (2,0) with a gap at (1,0); lintel spans x:0-3 at
    // elevation = pillarHeight, so it ties with the right pillar's depth key.
    const leftPillar = box(0, 0, 1, 1, 0, 'left-pillar')
    const rightPillar = box(2, 0, 1, 1, 0, 'right-pillar')
    const lintel = box(0, 0, 3, 1, 40, 'lintel')

    const sorted = sortBoxesForPainting([lintel, rightPillar, leftPillar])

    expect(sorted.map((b) => (b as typeof lintel).id)).toEqual(['left-pillar', 'right-pillar', 'lintel'])
  })

  it('orders a staircase bottom-step-first as footprint depth and elevation both increase together', () => {
    const step1 = box(0, 0, 1, 1, 0, 'step1')
    const step2 = box(1, 1, 1, 1, 20, 'step2')
    const step3 = box(2, 2, 1, 1, 40, 'step3')

    const sorted = sortBoxesForPainting([step3, step1, step2])

    expect(sorted.map((b) => (b as typeof step1).id)).toEqual(['step1', 'step2', 'step3'])
  })
})
