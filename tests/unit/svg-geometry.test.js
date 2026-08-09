import { describe, expect, it } from 'vitest'
import { clampScale, pointerCenter, pointerDistance } from '../../src/editor/svg-geometry.js'

describe('svg geometry primitives', () => {
  it('keeps canvas scale within the supported range', () => {
    expect(clampScale(0)).toBe(0.1)
    expect(clampScale(1.5)).toBe(1.5)
    expect(clampScale(12)).toBe(8)
  })

  it('calculates pointer distance and center without DOM APIs', () => {
    expect(pointerDistance({ x: 2, y: 3 }, { x: 5, y: 7 })).toBe(5)
    expect(pointerCenter({ x: 2, y: 4 }, { x: 6, y: 10 })).toEqual({ x: 4, y: 7 })
  })
})
