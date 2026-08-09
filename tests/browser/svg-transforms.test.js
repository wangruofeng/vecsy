import { describe, expect, it } from 'vitest'
import { groupLayers, removeLayers, translateElementsById } from '../../src/editor/svg-transforms.js'

const markup = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect data-editor-id="a"/><circle data-editor-id="b"/></svg>'

describe('SVG document transforms', () => {
  it('moves selected layers without changing unselected layers', () => {
    const nextMarkup = translateElementsById(markup, [{ id: 'a', dx: 12, dy: -4 }])

    expect(nextMarkup).toContain('data-editor-id="a" transform="translate(12.00 -4.00)"')
    expect(nextMarkup).toContain('data-editor-id="b"')
  })

  it('groups sibling layers and can remove the resulting group', () => {
    const grouped = groupLayers(markup, ['a', 'b'])
    expect(grouped.nextSelectedId).toBe('group-0')

    const removed = removeLayers(grouped.markup, ['group-0'])
    expect(removed.markup).not.toContain('data-editor-id="a"')
    expect(removed.markup).not.toContain('data-editor-id="b"')
  })
})
