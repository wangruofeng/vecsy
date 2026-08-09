export function identityMatrix() {
  return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
}

export function multiplyMatrices(left, right) {
  return {
    a: left.a * right.a + left.c * right.b,
    b: left.b * right.a + left.d * right.b,
    c: left.a * right.c + left.c * right.d,
    d: left.b * right.c + left.d * right.d,
    e: left.a * right.e + left.c * right.f + left.e,
    f: left.b * right.e + left.d * right.f + left.f,
  }
}

export function translateMatrix(x, y) {
  return { a: 1, b: 0, c: 0, d: 1, e: x, f: y }
}

export function scaleMatrix(x, y = x) {
  return { a: x, b: 0, c: 0, d: y, e: 0, f: 0 }
}

export function rotateMatrix(radians) {
  const cosine = Math.cos(radians)
  const sine = Math.sin(radians)
  return { a: cosine, b: sine, c: -sine, d: cosine, e: 0, f: 0 }
}

export function invertMatrix(matrix) {
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-12) return null
  return {
    a: matrix.d / determinant,
    b: -matrix.b / determinant,
    c: -matrix.c / determinant,
    d: matrix.a / determinant,
    e: (matrix.c * matrix.f - matrix.d * matrix.e) / determinant,
    f: (matrix.b * matrix.e - matrix.a * matrix.f) / determinant,
  }
}

export function transformPoint(matrix, point) {
  return { x: matrix.a * point.x + matrix.c * point.y + matrix.e, y: matrix.b * point.x + matrix.d * point.y + matrix.f }
}

export function shouldCommitGesture({ cancelled, moved }) {
  return !cancelled && moved
}

export function clampScale(value) {
  return Math.min(8, Math.max(0.1, value))
}

export function pointerDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y)
}

export function pointerCenter(first, second) {
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
}

function getSvgViewport(svg, rect) {
  const viewBox = svg.viewBox?.baseVal
  const viewBoxWidth = viewBox?.width || Number(svg.getAttribute('width')) || rect.width
  const viewBoxHeight = viewBox?.height || Number(svg.getAttribute('height')) || rect.height
  const viewBoxX = viewBox?.x || 0
  const viewBoxY = viewBox?.y || 0
  const preserve = (svg.getAttribute('preserveAspectRatio') || 'xMidYMid meet').trim()
  if (preserve.startsWith('none')) return { viewBoxX, viewBoxY, scaleX: rect.width / viewBoxWidth, scaleY: rect.height / viewBoxHeight, offsetX: 0, offsetY: 0 }
  const [alignment = 'xMidYMid', mode = 'meet'] = preserve.split(/\s+/)
  const scale = (mode === 'slice' ? Math.max : Math.min)(rect.width / viewBoxWidth, rect.height / viewBoxHeight)
  const remainingX = rect.width - viewBoxWidth * scale
  const remainingY = rect.height - viewBoxHeight * scale
  const offsetX = alignment.includes('xMin') ? 0 : alignment.includes('xMax') ? remainingX : remainingX / 2
  const offsetY = alignment.includes('YMin') ? 0 : alignment.includes('YMax') ? remainingY : remainingY / 2
  return { viewBoxX, viewBoxY, scaleX: scale, scaleY: scale, offsetX, offsetY }
}

export function getSvgPoint(svgWrap, clientX, clientY) {
  const svg = svgWrap?.querySelector('svg')
  const rect = svg?.getBoundingClientRect()
  if (!svg || !rect?.width || !rect?.height) return { x: clientX, y: clientY }
  const viewport = getSvgViewport(svg, rect)
  return {
    x: viewport.viewBoxX + (clientX - rect.left - viewport.offsetX) / viewport.scaleX,
    y: viewport.viewBoxY + (clientY - rect.top - viewport.offsetY) / viewport.scaleY,
  }
}

export function getSvgPointerDelta(svgWrap, start, current) {
  const startPoint = getSvgPoint(svgWrap, start.x, start.y)
  const currentPoint = getSvgPoint(svgWrap, current.x, current.y)
  return { x: currentPoint.x - startPoint.x, y: currentPoint.y - startPoint.y }
}

export function getElementPointerDelta(svgWrap, node, start, current) {
  const svg = svgWrap?.querySelector('svg')
  const parentMatrix = node?.parentElement?.getScreenCTM?.()
  if (!svg?.createSVGPoint || !parentMatrix?.inverse) return getSvgPointerDelta(svgWrap, start, current)
  const inverse = parentMatrix.inverse()
  const toParentPoint = ({ x, y }) => {
    const point = svg.createSVGPoint()
    point.x = x
    point.y = y
    return point.matrixTransform(inverse)
  }
  const startPoint = toParentPoint(start)
  const currentPoint = toParentPoint(current)
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
