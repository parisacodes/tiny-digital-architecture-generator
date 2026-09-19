import { describe, expect, it } from 'vitest'
import { colorsForStructure, derivePalette } from './palette'

function parseHslLightness(color: string): number {
  const match = /,\s*([\d.]+)%\)$/.exec(color)
  if (!match) throw new Error(`not an hsl() color: ${color}`)
  return Number(match[1])
}

function parseHslHue(color: string): number {
  const match = /^hsl\(([\d.]+),/.exec(color)
  if (!match) throw new Error(`not an hsl() color: ${color}`)
  return Number(match[1])
}

describe('derivePalette', () => {
  it('is deterministic for the same seed', () => {
    expect(derivePalette(42)).toEqual(derivePalette(42))
  })

  it('keeps the base hue within the warm-dusk (terracotta) band across many seeds', () => {
    for (let seed = 0; seed < 100; seed++) {
      const { baseHueDeg } = derivePalette(seed)
      expect(baseHueDeg).toBeGreaterThanOrEqual(18)
      expect(baseHueDeg).toBeLessThanOrEqual(34)
    }
  })
})

describe('colorsForStructure', () => {
  it('always keeps left darker than right, and right darker than top', () => {
    const palette = derivePalette(7)
    for (let colorSeed = 0; colorSeed < 1; colorSeed += 0.1) {
      const colors = colorsForStructure({ colorSeed }, palette)
      const top = parseHslLightness(colors.top)
      const right = parseHslLightness(colors.right)
      const left = parseHslLightness(colors.left)
      expect(left).toBeLessThan(right)
      expect(right).toBeLessThan(top)
    }
  })

  it('shifts the left (shadow) face hue toward umber rather than only darkening it', () => {
    const palette = derivePalette(7)
    const colors = colorsForStructure({ colorSeed: 0.5 }, palette)
    expect(parseHslHue(colors.left)).not.toBe(parseHslHue(colors.right))
  })
})
