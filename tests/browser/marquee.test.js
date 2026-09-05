import { afterEach, expect, it } from 'vitest'
import { getMarqueeIds } from '../../src/editor/marquee.js'
let host
afterEach(() => host?.remove())
it('selects contained visible layers in screen coordinates, without parent-child duplicates', () => {
  host = document.createElement('div')
  host.innerHTML = '<svg width="300" height="200"><g data-editor-id="g" transform="translate(20 10)"><rect data-editor-id="a" width="20" height="20"/><rect data-editor-id="b" x="60" width="20" height="20"/></g><g display="none"><rect data-editor-id="hidden" width="10" height="10"/></g></svg>'
  document.body.append(host)
  const r = host.querySelector('svg').getBoundingClientRect()
  expect(getMarqueeIds(host, { left:r.left, top:r.top, right:r.left+50, bottom:r.top+50 })).toEqual(['a'])
  expect(getMarqueeIds(host, { left:r.left, top:r.top, right:r.left+150, bottom:r.top+100 })).toEqual(['g'])
})
