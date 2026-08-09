import { describe, expect, it } from 'vitest'
import { editSvgDocument } from '../../src/editor/edit-svg-document.js'

const markup = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect data-editor-id="a" width="10"/><circle data-editor-id="b"/></svg>'

describe('SVG transactions', () => {
  it('returns markup and selection intent without mutating the input', () => {
    const result = editSvgDocument(markup, { type: 'set-attributes', targetId: 'a', updates: { width: '24' } })

    expect(result).toMatchObject({ changed: true, nextSelectedId: 'a' })
    expect(result.markup).toContain('width="24"')
    expect(markup).toContain('width="10"')
  })

  it('preserves one transaction result for a multi-layer movement', () => {
    const result = editSvgDocument(markup, { type: 'translate', targetIds: ['a', 'b'], selectedId: 'b', selectedIds: ['a', 'b'], delta: { x: 3, y: -2 } })

    expect(result).toMatchObject({ changed: true, nextSelectedId: 'b', nextSelectedIds: ['a', 'b'] })
    expect(result.markup).toContain('translate(3.00 -2.00)')
  })

  it('reports no change for a no-op edit', () => {
    expect(editSvgDocument(markup, { type: 'set-attributes', targetId: 'missing', updates: { fill: '#000' } })).toMatchObject({ markup, changed: false })
  })
})
