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

  it('supports AI runtime resize, text replacement, and shape insertion transactions', () => {
    const resized = editSvgDocument(markup, { type: 'resize', targetId: 'a', scale: 1.25 })
    const replaced = editSvgDocument('<svg xmlns="http://www.w3.org/2000/svg"><text data-editor-id="label">Old</text></svg>', { type: 'replace-text', targetId: 'label', text: 'Vecsy AI' })
    const inserted = editSvgDocument(markup, { type: 'insert-shape', shape: { id: 'node-ai-0', tag: 'circle', attributes: { cx: 50, cy: 50, r: 8 } } })

    expect(resized.markup).toContain('scale(1.2500)')
    expect(replaced.markup).toContain('>Vecsy AI</text>')
    expect(inserted).toMatchObject({ nextSelectedId: 'node-ai-0', nextSelectedIds: ['node-ai-0'] })
  })
})
