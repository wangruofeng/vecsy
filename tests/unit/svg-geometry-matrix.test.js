import { describe, expect, it } from 'vitest'
import { identityMatrix, invertMatrix, multiplyMatrices, rotateMatrix, scaleMatrix, shouldCommitGesture, transformPoint, translateMatrix } from '../../src/editor/svg-geometry.js'

describe('SVG affine matrix primitives', () => {
  it('composes scale then translation using SVG affine order', () => {
    const matrix = multiplyMatrices(translateMatrix(10, -4), scaleMatrix(2, 3))

    expect(transformPoint(matrix, { x: 5, y: 2 })).toEqual({ x: 20, y: 2 })
  })

  it('inverts a matrix and returns null for a non-invertible matrix', () => {
    const matrix = multiplyMatrices(translateMatrix(8, 12), rotateMatrix(Math.PI / 2))
    const inverse = invertMatrix(matrix)

    expect(inverse).not.toBeNull()
    expect(transformPoint(inverse, transformPoint(matrix, { x: 3, y: -2 })).x).toBeCloseTo(3)
    expect(transformPoint(inverse, transformPoint(matrix, { x: 3, y: -2 })).y).toBeCloseTo(-2)
    expect(invertMatrix({ ...identityMatrix(), a: 0, d: 0 })).toBeNull()
  })

  it('never commits a cancelled gesture', () => {
    expect(shouldCommitGesture({ cancelled: true, moved: true })).toBe(false)
    expect(shouldCommitGesture({ cancelled: false, moved: false })).toBe(false)
    expect(shouldCommitGesture({ cancelled: false, moved: true })).toBe(true)
  })
})
