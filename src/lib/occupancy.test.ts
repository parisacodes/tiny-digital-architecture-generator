import { describe, expect, it } from 'vitest'
import { canReserve, cellsForFootprint, createOccupancy, reserve } from './occupancy'

describe('cellsForFootprint', () => {
  it('returns a single cell for a unit footprint', () => {
    expect(cellsForFootprint({ x: 2, y: 3, width: 1, depth: 1 })).toEqual([{ x: 2, y: 3 }])
  })

  it('returns every cell spanned by a multi-cell footprint', () => {
    const cells = cellsForFootprint({ x: 0, y: 0, width: 3, depth: 1 })
    expect(cells).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ])
  })

  it('rounds a fractional/thin footprint outward to its full containing cell', () => {
    expect(cellsForFootprint({ x: 2.35, y: 2.35, width: 0.3, depth: 0.3 })).toEqual([{ x: 2, y: 2 }])
  })
})

describe('occupancy reservations', () => {
  it('allows reserving a free footprint and blocks it afterward', () => {
    const occupancy = createOccupancy(6)
    const footprint = { x: 1, y: 1, width: 1, depth: 1 }
    expect(canReserve(occupancy, footprint)).toBe(true)
    reserve(occupancy, footprint)
    expect(canReserve(occupancy, footprint)).toBe(false)
  })

  it('blocks a footprint that overlaps an already-reserved one, even partially', () => {
    const occupancy = createOccupancy(6)
    reserve(occupancy, { x: 0, y: 0, width: 1, depth: 1 })
    expect(canReserve(occupancy, { x: 0, y: 0, width: 2, depth: 1 })).toBe(false)
  })

  it('rejects footprints that fall outside the grid', () => {
    const occupancy = createOccupancy(4)
    expect(canReserve(occupancy, { x: 3, y: 0, width: 2, depth: 1 })).toBe(false)
    expect(canReserve(occupancy, { x: -1, y: 0, width: 1, depth: 1 })).toBe(false)
  })
})
