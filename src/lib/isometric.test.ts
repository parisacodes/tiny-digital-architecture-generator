import { describe, expect, it } from 'vitest'
import { gridToScreen, project } from './isometric'

describe('gridToScreen', () => {
  it('maps the origin to screen (0,0)', () => {
    expect(gridToScreen(0, 0)).toEqual({ x: 0, y: 0 })
  })

  it('matches the known isometric projection for a few grid cells', () => {
    expect(gridToScreen(1, 0)).toEqual({ x: 32, y: 16 })
    expect(gridToScreen(0, 1)).toEqual({ x: -32, y: 16 })
    expect(gridToScreen(1, 1)).toEqual({ x: 0, y: 32 })
    expect(gridToScreen(2, 1)).toEqual({ x: 32, y: 48 })
  })
})

describe('project', () => {
  it('adds the given origin offset to the projected point', () => {
    expect(project(1, 0, 200, 100)).toEqual({ x: 232, y: 116 })
    expect(project(0, 0, 200, 100)).toEqual({ x: 200, y: 100 })
  })
})
