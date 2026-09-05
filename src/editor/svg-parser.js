export const EDITABLE_TAGS = new Set(['rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path', 'text', 'g', 'image'])

const SVG_LENGTH_TO_PX = { px: 1, in: 96, cm: 96 / 2.54, mm: 96 / 25.4, pt: 96 / 72, pc: 16 }

function friendlyName(node, index) {
  return node.getAttribute('data-name') || node.getAttribute('id') || `${node.tagName.toLowerCase()} ${String(index + 1).padStart(2, '0')}`
}

function svgLengthToPx(value) {
  const match = /^\s*(\d*\.?\d+)\s*(px|in|cm|mm|pt|pc)?\s*$/i.exec(String(value || ''))
  if (!match) return null
  const amount = Number(match[1])
  if (!Number.isFinite(amount) || amount <= 0) return null
  return amount * (SVG_LENGTH_TO_PX[(match[2] || 'px').toLowerCase()] || 1)
}

// A viewBox lets the preview scale the artwork to fit the canvas wrap and
// keeps the rendered viewport consistent with the exported file.
function ensureViewBox(root) {
  if ((root.getAttribute('viewBox') || '').trim()) return
  const width = svgLengthToPx(root.getAttribute('width')) ?? 720
  const height = svgLengthToPx(root.getAttribute('height')) ?? 480
  const round = (value) => String(Math.round(value * 100) / 100)
  root.setAttribute('viewBox', `0 0 ${round(width)} ${round(height)}`)
}

export function parseSvg(markup) {
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml')
  if (doc.querySelector('parsererror') || !doc.documentElement || doc.documentElement.tagName !== 'svg') {
    throw new Error('This file does not contain a valid SVG.')
  }
  ensureViewBox(doc.documentElement)
  const hasContent = Array.from(doc.documentElement.children).length > 0
  let id = 0
  const usedIds = new Set(Array.from(doc.querySelectorAll('[data-editor-id]')).map((node) => node.getAttribute('data-editor-id')).filter(Boolean))
  const elements = []
  const nextEditorId = () => {
    while (usedIds.has(`node-${id}`)) id += 1
    const editorId = `node-${id++}`
    usedIds.add(editorId)
    return editorId
  }
  const walk = (node, depth = 0) => {
    Array.from(node.children).forEach((child, index) => {
      // defs/marker 内的图形（如线段端点装饰）是资源定义，不是图层
      if (child.tagName === 'defs' || child.tagName === 'marker') return
      if (!EDITABLE_TAGS.has(child.tagName)) return walk(child, depth)
      const existingId = child.getAttribute('data-editor-id')
      const editorId = existingId || nextEditorId()
      child.setAttribute('data-editor-id', editorId)
      elements.push({ id: editorId, tag: child.tagName, name: friendlyName(child, index), depth, node: child })
      walk(child, depth + 1)
    })
  }
  walk(doc.documentElement)
  return { markup: new XMLSerializer().serializeToString(doc.documentElement), elements, hasContent }
}

export function getColor(value) {
  if (!value || value === 'none' || value.startsWith('url(')) return ''
  return value.startsWith('#') ? value.toUpperCase() : value
}

export function getSvgColorTokens(markup) {
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml')
  const counts = new Map()
  const colorAttributes = ['fill', 'stroke', 'stop-color']
  const add = (value) => {
    const color = getColor(value?.trim())
    if (!color) return
    counts.set(color, (counts.get(color) || 0) + 1)
  }
  doc.querySelectorAll('[fill], [stroke], [stop-color], [style]').forEach((node) => {
    colorAttributes.forEach((attribute) => add(node.getAttribute(attribute)))
    const style = node.getAttribute('style') || ''
    style.split(';').forEach((rule) => {
      const [property, value] = rule.split(':')
      if (/^\s*(fill|stroke|stop-color)\s*$/i.test(property || '')) add(value)
    })
  })
  return Array.from(counts, ([color, count]) => ({ color, count })).sort((left, right) => right.count - left.count || left.color.localeCompare(right.color))
}

export function isElementHidden(node) {
  if (!node) return false
  if (node.getAttribute('display') === 'none' || node.getAttribute('visibility') === 'hidden') return true
  const style = node.getAttribute('style') || ''
  return /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(style)
}

export function setElementVisibility(node, hidden) {
  if (hidden) {
    node.setAttribute('display', 'none')
    return
  }
  node.removeAttribute('display')
  node.removeAttribute('visibility')
  const style = node.getAttribute('style') || ''
  const nextStyle = style
    .split(';')
    .map((rule) => rule.trim())
    .filter((rule) => rule && !/^(display|visibility)\s*:/i.test(rule))
    .join('; ')
  if (nextStyle) node.setAttribute('style', nextStyle)
  else node.removeAttribute('style')
}

export function getAncestorGroupIds(elements, targetId) {
  const ancestors = []
  for (const item of elements) {
    while (ancestors.length && ancestors[ancestors.length - 1].depth >= item.depth) ancestors.pop()
    if (item.id === targetId) return ancestors.filter((ancestor) => ancestor.tag === 'g').map((ancestor) => ancestor.id)
    ancestors.push(item)
  }
  return []
}

export function getElementAndDescendantIds(elements, targetId) {
  const startIndex = elements.findIndex((item) => item.id === targetId)
  if (startIndex < 0) return []
  const target = elements[startIndex]
  const ids = [target.id]
  for (let index = startIndex + 1; index < elements.length && elements[index].depth > target.depth; index += 1) ids.push(elements[index].id)
  return ids
}

export function getVisibleLayerItems(elements, expandedGroups) {
  const visible = []
  const ancestors = []
  elements.forEach((item, index) => {
    while (ancestors.length && ancestors[ancestors.length - 1].depth >= item.depth) ancestors.pop()
    const hiddenByCollapsedGroup = ancestors.some((ancestor) => ancestor.tag === 'g' && expandedGroups[ancestor.id] === false)
    if (!hiddenByCollapsedGroup) visible.push({ item, index })
    ancestors.push(item)
  })
  return visible
}
