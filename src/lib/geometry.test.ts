import { describe, expect, it } from 'vitest'
import { project } from './isometric'
import { getBoxFaces, type Box } from './geometry'

describe('getBoxFaces', () => {
  it('matches the original single-cell, ground-level cube geometry', () => {
    const originX = 200
    const originY = 100
    const gridX = 2
    const gridY = 1
    const height = 40

    const box: Box = {
      footprint: { x: gridX, y: gridY, width: 1, depth: 1 },
      elevation: 0,
      height,
    }

    const baseBack = project(gridX, gridY, originX, originY)
    const baseRight = project(gridX + 1, gridY, originX, originY)
    const baseFront = project(gridX + 1, gridY + 1, originX, originY)
    const baseLeft = project(gridX, gridY + 1, originX, originY)
    const raise = (p: { x: number; y: number }) => ({ x: p.x, y: p.y - height })

    const faces = getBoxFaces(box, originX, originY)

    expect(faces.top).toEqual([
      raise(baseBack),
      raise(baseRight),
      raise(baseFront),
      raise(baseLeft),
    ])
    expect(faces.left).toEqual([raise(baseLeft), baseLeft, baseFront, raise(baseFront)])
    expect(faces.right).toEqual([raise(baseFront), raise(baseRight), baseRight, baseFront])
  })

  it('raises both base and roof by elevation, preserving the box height between them', () => {
    const box: Box = {
      footprint: { x: 0, y: 0, width: 1, depth: 1 },
      elevation: 30,
      height: 20,
    }
    const faces = getBoxFaces(box, 0, 0)
    // top-left corner of the left face (roof) should sit exactly `height`
    // above the bottom-left corner (base) on screen.
    expect(faces.left[0].y).toBe(faces.left[1].y - 20)
    // and the base itself should sit `elevation` above the ground-level projection.
    expect(faces.left[1].y).toBe(project(0, 1, 0, 0).y - 30)
  })
})
