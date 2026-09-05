import { describe, expect, it } from 'vitest'
import { createLayerMarkup, groupLayers, removeLayers, translateElementsById } from '../../src/editor/svg-transforms.js'
import { ADD_LAYER_TAGS } from '../../src/app/copy.js'

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

describe('createLayerMarkup arrow', () => {
  it('offers arrow instead of polyline and path in the add-layer menu', () => {
    expect(ADD_LAYER_TAGS).not.toContain('polyline')
    expect(ADD_LAYER_TAGS).not.toContain('path')
    expect(ADD_LAYER_TAGS).toContain('arrow')
  })

  it('creates a line with a triangle-arrow end marker', () => {
    const created = createLayerMarkup(markup, 'arrow')
    const doc = new DOMParser().parseFromString(created.markup, 'image/svg+xml')
    const line = doc.querySelector(`[data-editor-id="${created.id}"]`)
    expect(line.tagName).toBe('line')
    expect(line.getAttribute('data-name')).toBe('Arrow')
    expect(line.getAttribute('marker-end')).toBe('url(#vecsy-cap-triangle-arrow)')
    expect(doc.querySelector('defs > marker#vecsy-cap-triangle-arrow')).not.toBeNull()
    // 直线模板自带的坐标/描边保持不变，箭头仅由结束点 marker 承载
    expect(line.getAttribute('x2')).not.toBeNull()
    expect(line.getAttribute('stroke')).toBe('#F2A93B')
  })
})
