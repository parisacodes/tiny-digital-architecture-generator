export type RandomFn = () => number

/** Deterministic PRNG (mulberry32). Same seed always produces the same sequence. */
export function createSeededRandom(seed: number): RandomFn {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Derives an independent deterministic seed from a base seed + a salt label,
 * so unrelated concerns (layout vs. palette) can each get their own RNG
 * stream without one's call count affecting the other's output.
 */
export function deriveSubSeed(seed: number, salt: string): number {
  let hash = 0x811c9dc5
  const input = `${seed}:${salt}`
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}
