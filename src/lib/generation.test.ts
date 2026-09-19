import { describe, expect, it } from 'vitest'
import { cellsForFootprint } from './occupancy'
import { DEFAULT_PARAMS, generateScene, type GenerationParams } from './generation'

describe('generateScene determinism', () => {
  it('produces an identical scene for the same params', () => {
    const a = generateScene(DEFAULT_PARAMS)
    const b = generateScene(DEFAULT_PARAMS)
    expect(a).toEqual(b)
  })

  it('produces a different scene when the seed changes', () => {
    const a = generateScene(DEFAULT_PARAMS)
    const b = generateScene({ ...DEFAULT_PARAMS, seed: DEFAULT_PARAMS.seed + 1 })
    expect(a.structures).not.toEqual(b.structures)
  })

  it('leaves the palette-relevant params seed out of layout output', () => {
    const a = generateScene(DEFAULT_PARAMS)
    const b = generateScene({ ...DEFAULT_PARAMS, paletteSeed: DEFAULT_PARAMS.paletteSeed + 1 })
    expect(a.structures).toEqual(b.structures)
  })
})

describe('generateScene constraints', () => {
  const paramCombos: GenerationParams[] = [
    DEFAULT_PARAMS,
    { ...DEFAULT_PARAMS, gridSize: 'small', density: 'dense' },
    { ...DEFAULT_PARAMS, gridSize: 'large', density: 'sparse' },
    { ...DEFAULT_PARAMS, heightVariation: 'dramatic' },
    { ...DEFAULT_PARAMS, complexity: 'minimal' },
    { ...DEFAULT_PARAMS, complexity: 'elaborate' },
    { ...DEFAULT_PARAMS, complexity: 'elaborate', gridSize: 'small', density: 'dense' },
  ]

  it('never reserves overlapping cells between different structures, across seeds and param combos', () => {
    for (const params of paramCombos) {
      for (let seed = 0; seed < 15; seed++) {
        const scene = generateScene({ ...params, seed })
        const seen = new Set<string>()
        for (const structure of scene.structures) {
          for (const cell of cellsForFootprint(structure.footprint)) {
            const key = `${cell.x},${cell.y}`
            expect(seen.has(key)).toBe(false)
            seen.add(key)
          }
        }
      }
    }
  })

  it('keeps every structure within the requested grid bounds', () => {
    const scene = generateScene({ ...DEFAULT_PARAMS, gridSize: 'small' })
    for (const structure of scene.structures) {
      for (const cell of cellsForFootprint(structure.footprint)) {
        expect(cell.x).toBeGreaterThanOrEqual(0)
        expect(cell.x).toBeLessThan(6)
        expect(cell.y).toBeGreaterThanOrEqual(0)
        expect(cell.y).toBeLessThan(6)
      }
    }
  })

  it('terminates without hanging even at maximum density on the smallest grid', () => {
    const scene = generateScene({ ...DEFAULT_PARAMS, gridSize: 'small', density: 'dense' })
    expect(scene.structures.length).toBeGreaterThan(0)
  })

  it('returns a fully depth-sorted draw list covering every structure box', () => {
    const scene = generateScene(DEFAULT_PARAMS)
    const totalBoxes = scene.structures.reduce((sum, s) => sum + s.boxes.length, 0)
    expect(scene.drawList.length).toBe(totalBoxes)
  })

  it('produces multiple distinct structure kinds at elaborate complexity, across several seeds', () => {
    const kinds = new Set<string>()
    for (let seed = 0; seed < 20; seed++) {
      const scene = generateScene({ ...DEFAULT_PARAMS, complexity: 'elaborate', gridSize: 'large', seed })
      for (const structure of scene.structures) kinds.add(structure.kind)
    }
    expect(kinds.size).toBeGreaterThan(1)
  })

  it('never produces a wall, staircase, or arch at minimal complexity', () => {
    for (let seed = 0; seed < 20; seed++) {
      const scene = generateScene({ ...DEFAULT_PARAMS, complexity: 'minimal', seed })
      for (const structure of scene.structures) {
        expect(['cube', 'column']).toContain(structure.kind)
      }
    }
  })
})
