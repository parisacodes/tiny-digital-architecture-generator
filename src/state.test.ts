import { describe, expect, it } from 'vitest'
import { DEFAULT_PARAMS } from './lib/generation'
import { paramsToSearchParams, searchParamsToParams } from './state'

describe('params <-> URL round trip', () => {
  it('round-trips every field through the URL unchanged', () => {
    const params = {
      ...DEFAULT_PARAMS,
      seed: 999,
      paletteSeed: 111,
      gridSize: 'large' as const,
      density: 'dense' as const,
      heightVariation: 'dramatic' as const,
      complexity: 'elaborate' as const,
    }
    const roundTripped = searchParamsToParams(paramsToSearchParams(params), DEFAULT_PARAMS)
    expect(roundTripped).toEqual(params)
  })
})

describe('searchParamsToParams fallback behavior', () => {
  it('falls back to defaults for a missing query string entirely', () => {
    expect(searchParamsToParams(new URLSearchParams(''), DEFAULT_PARAMS)).toEqual(DEFAULT_PARAMS)
  })

  it('falls back to defaults field-by-field for malformed values, without throwing', () => {
    const search = new URLSearchParams('seed=not-a-number&gridSize=huge&density=dense')
    const result = searchParamsToParams(search, DEFAULT_PARAMS)
    expect(result.seed).toBe(DEFAULT_PARAMS.seed)
    expect(result.gridSize).toBe(DEFAULT_PARAMS.gridSize)
    expect(result.density).toBe('dense')
  })
})
