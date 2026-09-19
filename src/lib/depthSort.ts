import type { Box, GridFootprint } from './geometry'

/**
 * A footprint's "front corner" ground-depth sum. Because boxes are
 * base-anchored (lib/geometry.ts), a box's on-screen silhouette never
 * extends past the screen row implied by its own front corner, so sorting
 * ascending by this key and painting in that order is correct for any mix
 * of heights and elevations — the same `gridX + gridY` rule the original
 * single-cell cube sort used, generalized to arbitrary footprints.
 */
export function depthKey(footprint: GridFootprint): number {
  return footprint.x + footprint.width - 1 + (footprint.y + footprint.depth - 1)
}

/**
 * Orders two boxes for back-to-front painting. Ties happen either because
 * two disjoint footprints share a front-corner sum (they're side-by-side on
 * screen — order is visually irrelevant) or because both boxes belong to
 * the same structure and are stacked/flush (e.g. an arch's lintel resting
 * on its pillars) — there, the lower box must paint first so the higher one
 * correctly covers the seam, hence the elevation tiebreak.
 */
export function compareBoxes(a: Box, b: Box): number {
  const depthDiff = depthKey(a.footprint) - depthKey(b.footprint)
  if (depthDiff !== 0) return depthDiff
  return a.elevation - b.elevation
}

export function sortBoxesForPainting(boxes: readonly Box[]): Box[] {
  return [...boxes].sort(compareBoxes)
}
