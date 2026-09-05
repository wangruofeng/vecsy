import { expect, it } from 'vitest'
import { getLayerDistanceGuides } from '../../src/editor/layer-distances.js'
const a = { left: 10, top: 10, right: 30, bottom: 30 }
const distances = (b) => getLayerDistanceGuides(a, b).map(g => Math.hypot(g.x2 - g.x1, g.y2 - g.y1))
it('measures horizontal and vertical gaps symmetrically', () => {
  expect(distances({ left: 50, top: 10, right: 70, bottom: 30 })).toEqual([20])
  expect(distances({ left: 10, top: 70, right: 30, bottom: 90 })).toEqual([40])
  const b = { left: -30, top: -50, right: -10, bottom: -30 }
  expect(distances(b)).toEqual([20, 40])
  expect(getLayerDistanceGuides(b, a).map(g => Math.hypot(g.x2-g.x1, g.y2-g.y1))).toEqual([20, 40])
})
it('measures four containment insets and overlapping edge offsets', () => {
  expect(distances({ left: 0, top: 0, right: 80, bottom: 100 })).toEqual([10, 50, 10, 70])
  expect(distances({ left: 20, top: 20, right: 40, bottom: 40 })).toEqual([10, 10, 10, 10])
  expect(distances(a)).toEqual([])
})
