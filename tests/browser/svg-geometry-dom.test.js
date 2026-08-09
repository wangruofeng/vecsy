import { afterEach, describe, expect, it } from 'vitest'
import { getElementPointerDelta, getSvgPoint } from '../../src/editor/svg-geometry.js'
import { translateElements } from '../../src/editor/svg-transforms.js'

const hosts = []

function mount(markup) {
  const host = document.createElement('div')
  host.style.cssText = 'position:absolute;left:0;top:0;width:240px;height:160px'
  host.innerHTML = markup
  document.body.append(host)
  hosts.push(host)
  return host
}

afterEach(() => hosts.splice(0).forEach((host) => host.remove()))

describe('SVG DOM geometry adapters', () => {
  it('maps screen coordinates into the SVG viewBox', () => {
    const host = mount('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 100 50"><rect width="100" height="50"/></svg>')
    const rect = host.querySelector('svg').getBoundingClientRect()

    expect(getSvgPoint(host, rect.left + 100, rect.top + 50)).toEqual({ x: 50, y: 25 })
  })

  it('accounts for default preserveAspectRatio letterboxing', () => {
    const host = mount('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 100 100"><rect width="100" height="100"/></svg>')
    const rect = host.querySelector('svg').getBoundingClientRect()

    expect(getSvgPoint(host, rect.left + 50, rect.top + 50)).toEqual({ x: 0, y: 50 })
    expect(getSvgPoint(host, rect.left + 150, rect.top + 50)).toEqual({ x: 100, y: 50 })
  })

  it('uses the rendered bounds after a canvas-scale transform', () => {
    const host = mount('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 100 50"><rect width="100" height="50"/></svg>')
    host.style.transform = 'scale(2)'
    host.style.transformOrigin = 'top left'
    const rect = host.querySelector('svg').getBoundingClientRect()

    expect(getSvgPoint(host, rect.left + rect.width / 2, rect.top + rect.height / 2)).toEqual({ x: 50, y: 25 })
  })

  it('maps a screen movement into the transformed parent coordinate space', () => {
    const host = mount('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 100 50"><g transform="translate(10 5) scale(2)"><rect data-editor-id="a" width="10" height="10"/></g></svg>')
    const node = host.querySelector('[data-editor-id="a"]')
    const parentRect = node.parentElement.getBoundingClientRect()
    const delta = getElementPointerDelta(host, node, { x: parentRect.left + 20, y: parentRect.top + 20 }, { x: parentRect.left + 40, y: parentRect.top + 20 })

    expect(delta.x).toBeCloseTo(5)
    expect(delta.y).toBeCloseTo(0)
  })

  it('uses the inverse of a matrix parent for pointer deltas', () => {
    const host = mount('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><g transform="matrix(0 2 -2 0 40 20)"><rect data-editor-id="a" width="10" height="10"/></g></svg>')
    const node = host.querySelector('[data-editor-id="a"]')
    const parentRect = node.parentElement.getBoundingClientRect()
    const delta = getElementPointerDelta(host, node, { x: parentRect.left + 20, y: parentRect.top + 20 }, { x: parentRect.left + 40, y: parentRect.top + 20 })

    expect(delta.x).toBeCloseTo(0)
    expect(delta.y).toBeCloseTo(-10)
  })

  it('prepends a movement so it stays in parent coordinates before an existing scale', () => {
    const markup = '<svg xmlns="http://www.w3.org/2000/svg"><rect data-editor-id="a" transform="scale(2)"/></svg>'
    const result = translateElements(markup, ['a'], { x: 5, y: 0 })
    const host = mount(result)

    expect(host.querySelector('[data-editor-id="a"]').getAttribute('transform')).toBe('translate(5.00 0.00) scale(2)')
    expect(host.querySelector('[data-editor-id="a"]').getCTM().e).toBeCloseTo(5)
  })
})
