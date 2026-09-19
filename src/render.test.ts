import { describe, expect, it } from 'vitest'
import { computeSceneFit } from './render'

describe('computeSceneFit', () => {
  it('centers a square scene with uniform scale in a larger square viewport', () => {
    const bounds = { minX: -50, maxX: 50, minY: 0, maxY: 100 }
    const fit = computeSceneFit(bounds, 400, 400, 1)
    expect(fit.scale).toBeCloseTo(4)
    expect(fit.originX).toBeCloseTo(0)
    expect(fit.originY).toBeCloseTo(-50)
  })

  it('is limited by the tighter of width/height when the viewport is not square', () => {
    const bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 }
    const fit = computeSceneFit(bounds, 800, 200, 1)
    expect(fit.scale).toBeCloseTo(2)
  })

  it('applies the padding factor', () => {
    const bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 }
    const fit = computeSceneFit(bounds, 200, 200, 0.5)
    expect(fit.scale).toBeCloseTo(1)
  })
})
