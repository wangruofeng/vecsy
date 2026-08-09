import { describe, expect, it } from 'vitest'
import { filterSvgToLayerIds, sanitizeForExport, withExplicitSize } from '../../src/editor/svg-transforms.js'

const markup = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40"><rect data-editor-id="a" data-editor-collection-icon="1" width="20"/><circle data-editor-id="b" cx="40" cy="20" r="10"/></svg>'

describe('SVG export transforms', () => {
  it('removes editor-only attributes before export', () => {
    const output = sanitizeForExport(markup)

    expect(output).not.toContain('data-editor-id')
    expect(output).not.toContain('data-editor-collection-icon')
  })

  it('exports only selected layers while retaining the SVG root', () => {
    const output = filterSvgToLayerIds(markup, ['b'])

    expect(output).toContain('<svg')
    expect(output).not.toContain('data-editor-id="a"')
    expect(output).toContain('data-editor-id="b"')
  })

  it('adds explicit dimensions without overwriting existing dimensions', () => {
    expect(withExplicitSize('<svg xmlns="http://www.w3.org/2000/svg"/>', 80, 40)).toContain('width="80" height="40"')
  })
})
