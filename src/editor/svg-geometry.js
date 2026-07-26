export function clampScale(value) {
  return Math.min(8, Math.max(0.1, value))
}

export function pointerDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y)
}

export function pointerCenter(first, second) {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
}

export function getSvgPoint(svgWrap, clientX, clientY) {
  const svg = svgWrap?.querySelector('svg')
  const rect = svg?.getBoundingClientRect()
  if (!svg || !rect?.width || !rect?.height) return { x: clientX, y: clientY }
  const viewBox = svg.viewBox?.baseVal
  const width = viewBox?.width || Number(svg.getAttribute('width')) || rect.width
  const height = viewBox?.height || Number(svg.getAttribute('height')) || rect.height
  return {
    x: (viewBox?.x || 0) + (clientX - rect.left) * width / rect.width,
    y: (viewBox?.y || 0) + (clientY - rect.top) * height / rect.height,
  }
}

export function getSvgPointerDelta(svgWrap, start, current) {
  const startPoint = getSvgPoint(svgWrap, start.x, start.y)
  const currentPoint = getSvgPoint(svgWrap, current.x, current.y)
  return { x: currentPoint.x - startPoint.x, y: currentPoint.y - startPoint.y }
}

// Measure an SVG node's rendered bounds, including portions outside the viewport.
export function getNodeRect(node) {
  const rect = node?.getBoundingClientRect?.()
  if (!rect || (!rect.width && !rect.height)) return null
  return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height }
}

export function getTopLevelSelectedIds(rawMarkup, targetIds) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const selected = new Set(targetIds)
  return targetIds.filter((targetId) => {
    let parent = doc.querySelector(`[data-editor-id="${targetId}"]`)?.parentElement
    while (parent) {
      if (selected.has(parent.getAttribute('data-editor-id'))) return false
      parent = parent.parentElement
    }
    return true
  })
}

export function getSvgDimensions(doc) {
  const root = doc.documentElement
  const viewBox = (root.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number)
  if (viewBox.length === 4 && viewBox.every(Number.isFinite)) return { x: viewBox[0], y: viewBox[1], width: viewBox[2], height: viewBox[3] }
  return { x: 0, y: 0, width: Number(root.getAttribute('width')) || 720, height: Number(root.getAttribute('height')) || 480 }
}
