import type { GridCoord, GridFootprint } from './geometry'

export interface GridOccupancy {
  size: number
  cells: Set<string>
}

export function createOccupancy(size: number): GridOccupancy {
  return { size, cells: new Set() }
}

function cellKey(x: number, y: number): string {
  return `${x},${y}`
}

/**
 * Every integer grid cell a footprint touches, floored/ceiled outward so a
 * thin or fractional footprint (e.g. a column) still reserves its full
 * containing cell(s) — this keeps "different structures never overlap" a
 * simple set-membership check instead of continuous polygon-overlap math.
 */
export function cellsForFootprint(footprint: GridFootprint): GridCoord[] {
  const minX = Math.floor(footprint.x)
  const maxX = Math.ceil(footprint.x + footprint.width) - 1
  const minY = Math.floor(footprint.y)
  const maxY = Math.ceil(footprint.y + footprint.depth) - 1

  const cells: GridCoord[] = []
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      cells.push({ x, y })
    }
  }
  return cells
}

function isWithinBounds(occupancy: GridOccupancy, footprint: GridFootprint): boolean {
  return cellsForFootprint(footprint).every(
    (cell) => cell.x >= 0 && cell.x < occupancy.size && cell.y >= 0 && cell.y < occupancy.size
  )
}

export function canReserve(occupancy: GridOccupancy, footprint: GridFootprint): boolean {
  if (!isWithinBounds(occupancy, footprint)) return false
  return cellsForFootprint(footprint).every((cell) => !occupancy.cells.has(cellKey(cell.x, cell.y)))
}

export function reserve(occupancy: GridOccupancy, footprint: GridFootprint): void {
  for (const cell of cellsForFootprint(footprint)) {
    occupancy.cells.add(cellKey(cell.x, cell.y))
  }
}
