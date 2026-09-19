import { createSeededRandom, deriveSubSeed } from './random'

export interface FaceColors {
  top: string
  left: string
  right: string
}

export interface PaletteConfig {
  paletteSeed: number
  baseHueDeg: number
  hueJitterDeg: number
  saturation: [number, number]
  lightness: { top: number; right: number; left: number }
  background: { from: string; to: string }
}

// Warm dusk / terracotta band: sandstone, clay, and amber roof hues.
const HUE_RANGE: [number, number] = [18, 34]
const HUE_JITTER_RANGE: [number, number] = [6, 10]
const SATURATION_LOW_RANGE: [number, number] = [55, 62]
const SATURATION_HIGH_RANGE: [number, number] = [65, 72]
// Indigo sky at the top of the frame, fading to a rose horizon.
const SKY_TOP_HUE_RANGE: [number, number] = [250, 265]
const SKY_HORIZON_HUE_RANGE: [number, number] = [8, 18]

function lerp(min: number, max: number, t: number): number {
  return min + (max - min) * t
}

function hsl(hue: number, saturation: number, lightness: number): string {
  const normalizedHue = ((hue % 360) + 360) % 360
  return `hsl(${normalizedHue.toFixed(1)}, ${saturation.toFixed(1)}%, ${lightness.toFixed(1)}%)`
}

/** Derives a cohesive warm-dusk palette purely from `paletteSeed`, independent of layout generation. */
export function derivePalette(paletteSeed: number): PaletteConfig {
  const rng = createSeededRandom(deriveSubSeed(paletteSeed, 'palette'))

  return {
    paletteSeed,
    baseHueDeg: lerp(...HUE_RANGE, rng()),
    hueJitterDeg: lerp(...HUE_JITTER_RANGE, rng()),
    saturation: [lerp(...SATURATION_LOW_RANGE, rng()), lerp(...SATURATION_HIGH_RANGE, rng())],
    lightness: { top: 68, right: 52, left: 34 },
    background: {
      from: hsl(lerp(...SKY_TOP_HUE_RANGE, rng()), 38, 20),
      to: hsl(lerp(...SKY_HORIZON_HUE_RANGE, rng()), 62, 62),
    },
  }
}

/**
 * Derives one structure's face colors from the shared palette. The light
 * direction (top lightest, right mid-lit, left darkest and shifted toward
 * umber rather than just darkened) is fixed and seed-invariant, so every
 * composition reads as consistent real light regardless of seed.
 */
export function colorsForStructure(structure: { colorSeed: number }, palette: PaletteConfig): FaceColors {
  const jitter = (structure.colorSeed * 2 - 1) * palette.hueJitterDeg
  const hue = palette.baseHueDeg + jitter
  const saturation = lerp(...palette.saturation, structure.colorSeed)

  return {
    top: hsl(hue, saturation, palette.lightness.top),
    left: hsl(hue - 6, saturation * 0.85, palette.lightness.left),
    right: hsl(hue, saturation, palette.lightness.right),
  }
}
