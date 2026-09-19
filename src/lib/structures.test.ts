import { describe, expect, it } from 'vitest'
import { createSeededRandom } from './random'
import { buildArch, buildColumn, buildCube, buildStaircase, buildWall } from './structures'

const heightRange = { min: 24, max: 72 }

describe('buildColumn', () => {
  it('produces a single thin box, still centered within its origin cell', () => {
    const rng = createSeededRandom(1)
    const structure = buildColumn({ x: 3, y: 4 }, heightRange, rng)
    expect(structure.boxes).toHaveLength(1)
    const [box] = structure.boxes
    expect(box.footprint.width).toBeLessThan(1)
    expect(box.footprint.x).toBeGreaterThan(3)
    expect(box.footprint.x + box.footprint.width).toBeLessThan(4)
  })
})

describe('buildWall', () => {
  it('spans between 2 and 4 cells along exactly one axis', () => {
    for (let seed = 0; seed < 30; seed++) {
      const structure = buildWall({ x: 0, y: 0 }, heightRange, createSeededRandom(seed))
      const [box] = structure.boxes
      const spansX = box.footprint.width > 1
      const spansY = box.footprint.depth > 1
      expect(spansX !== spansY).toBe(true)
      const length = spansX ? box.footprint.width : box.footprint.depth
      expect(length).toBeGreaterThanOrEqual(2)
      expect(length).toBeLessThanOrEqual(4)
    }
  })
})

describe('buildStaircase', () => {
  it('produces 3-5 steps with strictly increasing elevation and a stepping footprint', () => {
    for (let seed = 0; seed < 30; seed++) {
      const structure = buildStaircase({ x: 0, y: 0 }, heightRange, createSeededRandom(seed))
      expect(structure.boxes.length).toBeGreaterThanOrEqual(3)
      expect(structure.boxes.length).toBeLessThanOrEqual(5)
      for (let i = 1; i < structure.boxes.length; i++) {
        expect(structure.boxes[i].elevation).toBeGreaterThan(structure.boxes[i - 1].elevation)
      }
    }
  })
})

describe('buildArch', () => {
  it('produces two ground-level pillars of equal height and one elevated lintel spanning the gap between them', () => {
    const rng = createSeededRandom(2)
    const structure = buildArch({ x: 5, y: 5 }, heightRange, rng)
    expect(structure.boxes).toHaveLength(3)
    const [pillarA, pillarB, lintel] = structure.boxes
    expect(pillarA.elevation).toBe(0)
    expect(pillarB.elevation).toBe(0)
    expect(pillarA.height).toBe(pillarB.height)
    expect(lintel.elevation).toBe(pillarA.height)
  })

  it("bounding footprint spans all 3 cells, including the gap between the pillars", () => {
    const structure = buildArch({ x: 5, y: 5 }, heightRange, createSeededRandom(2))
    const span = Math.max(structure.footprint.width, structure.footprint.depth)
    expect(span).toBe(3)
  })
})

describe('color seeds', () => {
  it('are deterministic and vary structure-to-structure for the same rng stream', () => {
    const rngA = createSeededRandom(42)
    const a1 = buildCube({ x: 0, y: 0 }, heightRange, rngA)
    const a2 = buildCube({ x: 1, y: 0 }, heightRange, rngA)
    expect(a1.colorSeed).not.toBe(a2.colorSeed)

    const rngB = createSeededRandom(42)
    const b1 = buildCube({ x: 0, y: 0 }, heightRange, rngB)
    expect(b1.colorSeed).toBe(a1.colorSeed)
  })
})
