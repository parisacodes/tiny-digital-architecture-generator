import { describe, expect, it } from 'vitest'
import { createSeededRandom, deriveSubSeed } from './random'

describe('createSeededRandom', () => {
  it('produces an identical sequence for the same seed', () => {
    const a = createSeededRandom(12345)
    const b = createSeededRandom(12345)
    const seqA = Array.from({ length: 20 }, () => a())
    const seqB = Array.from({ length: 20 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('produces different sequences for different seeds', () => {
    const a = createSeededRandom(1)
    const b = createSeededRandom(2)
    expect(a()).not.toBe(b())
  })

  it('always returns values in [0, 1)', () => {
    const rng = createSeededRandom(999)
    for (let i = 0; i < 200; i++) {
      const value = rng()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('deriveSubSeed', () => {
  it('is deterministic for the same seed and salt', () => {
    expect(deriveSubSeed(12345, 'layout')).toBe(deriveSubSeed(12345, 'layout'))
  })

  it('produces different values for different salts', () => {
    expect(deriveSubSeed(12345, 'layout')).not.toBe(deriveSubSeed(12345, 'palette'))
  })

  it('produces different values for different seeds', () => {
    expect(deriveSubSeed(1, 'layout')).not.toBe(deriveSubSeed(2, 'layout'))
  })
})
