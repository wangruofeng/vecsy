import { describe, expect, it } from 'vitest'
import { parseSvg } from '../../src/editor/svg-parser.js'

describe('SVG parser', () => {
  it('normalizes the viewBox and assigns stable editor ids', () => {
    const result = parseSvg('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120"><rect id="card" width="80" height="40"/></svg>')

    expect(result.markup).toContain('viewBox="0 0 240 120"')
    expect(result.elements).toHaveLength(1)
    expect(result.elements[0]).toMatchObject({ id: 'node-0', tag: 'rect', name: 'card' })
  })

  it('rejects malformed SVG input', () => {
    expect(() => parseSvg('<svg><rect></svg>')).toThrow('valid SVG')
  })
})
