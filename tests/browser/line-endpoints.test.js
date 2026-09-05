import { expect, it } from 'vitest'
import { updateLineEndpointStyle } from '../../src/editor/svg-transforms.js'

it.each(['start', 'end'])('joins a solid reversed triangle to the line at %s', (end) => {
  const source = '<svg xmlns="http://www.w3.org/2000/svg"><line data-editor-id="line" x1="100" y1="100" x2="400" y2="100" stroke="#993b3b" stroke-width="20"/></svg>'
  const result = updateLineEndpointStyle(source, 'line', end, 'reversed-triangle')
  const doc = new DOMParser().parseFromString(result, 'image/svg+xml')
  const marker = doc.querySelector('marker')
  expect(marker.querySelector('path').getAttribute('fill')).toBe('context-stroke')
  expect(marker.querySelector('path').hasAttribute('stroke')).toBe(false)
  expect(marker.getAttribute('orient')).toBe('auto-start-reverse')
  expect(doc.querySelector('line').getAttribute(`marker-${end}`)).toBe('url(#vecsy-cap-reversed-triangle)')
  // Reapplying the style must refresh definitions saved by older editor versions.
  marker.querySelector('path').setAttribute('fill', 'none')
  const refreshed = updateLineEndpointStyle(new XMLSerializer().serializeToString(doc), 'line', end, 'reversed-triangle')
  expect(new DOMParser().parseFromString(refreshed, 'image/svg+xml').querySelector('marker path').getAttribute('fill')).toBe('context-stroke')
})

it('keeps both triangle styles the same geometric size', () => {
  const source = '<svg xmlns="http://www.w3.org/2000/svg"><line data-editor-id="line"/></svg>'
  const sizes = ['triangle-arrow', 'reversed-triangle'].map(style => {
    const container = document.createElement('div')
    container.innerHTML = updateLineEndpointStyle(source, 'line', 'end', style)
    document.body.appendChild(container)
    try {
      const bounds = container.querySelector('marker path').getBBox()
      return { width: bounds.width, height: bounds.height }
    } finally {
      container.remove()
    }
  })
  expect(sizes[1]).toEqual(sizes[0])
})
