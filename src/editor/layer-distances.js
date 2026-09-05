// Bounds and guide coordinates share the same coordinate space.
export function getLayerDistanceGuides(a, b) {
  const guides = []
  const axis = (start, end, crossStart, crossEnd, horizontal) => {
    const overlapStart = Math.max(a[crossStart], b[crossStart])
    const overlapEnd = Math.min(a[crossEnd], b[crossEnd])
    const cross = overlapStart <= overlapEnd ? (overlapStart + overlapEnd) / 2 : (a[crossStart] + a[crossEnd]) / 2
    const add = (from, to) => guides.push(horizontal
      ? { x1: from, y1: cross, x2: to, y2: cross }
      : { x1: cross, y1: from, x2: cross, y2: to })
    if (a[end] <= b[start]) add(a[end], b[start])
    else if (b[end] <= a[start]) add(b[end], a[start])
    else {
      add(a[start], b[start])
      add(a[end], b[end])
    }
  }
  const separatedX = a.right <= b.left || b.right <= a.left
  const separatedY = a.bottom <= b.top || b.bottom <= a.top
  if (separatedX || !separatedY) axis('left', 'right', 'top', 'bottom', true)
  if (separatedY || !separatedX) axis('top', 'bottom', 'left', 'right', false)
  return guides.filter(({ x1, y1, x2, y2 }) => x1 !== x2 || y1 !== y2)
}
