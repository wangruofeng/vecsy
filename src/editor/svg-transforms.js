import { EDITABLE_TAGS } from './svg-parser.js'
import { getSvgDimensions } from './svg-geometry.js'

export function updateElementTransform(rawMarkup, targetId, transform) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const node = doc.querySelector(`[data-editor-id="${targetId}"]`)
  if (!node) return rawMarkup
  if (transform) node.setAttribute('transform', transform)
  else node.removeAttribute('transform')
  return new XMLSerializer().serializeToString(doc.documentElement)
}

function parseTranslateScaleTransform(transform) {
  if (!transform.trim()) return { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 }
  const functionPattern = /([A-Za-z]+)\s*\(([^)]*)\)/g
  const numberPattern = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g
  let match
  let cursor = 0
  let scaleX = 1
  let scaleY = 1
  let translateX = 0
  let translateY = 0
  while ((match = functionPattern.exec(transform))) {
    if (!/^[\s,]*$/.test(transform.slice(cursor, match.index))) return null
    cursor = functionPattern.lastIndex
    const values = match[2].match(numberPattern)?.map(Number) || []
    if (match[2].replace(numberPattern, '').replace(/[\s,]/g, '') || values.some((value) => !Number.isFinite(value))) return null
    if (match[1] === 'translate' && (values.length === 1 || values.length === 2)) {
      translateX += scaleX * values[0]
      translateY += scaleY * (values[1] ?? 0)
    } else if (match[1] === 'scale' && (values.length === 1 || values.length === 2)) {
      scaleX *= values[0]
      scaleY *= values[1] ?? values[0]
    } else {
      return null
    }
  }
  return /^[\s,]*$/.test(transform.slice(cursor)) ? { scaleX, scaleY, translateX, translateY } : null
}

export function bakeRectTranslateScaleTransform(rawMarkup, targetId) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const node = doc.querySelector(`[data-editor-id="${targetId}"]`)
  if (node?.tagName !== 'rect') return null
  const matrix = parseTranslateScaleTransform(node.getAttribute('transform') || '')
  const x = Number(node.getAttribute('x')) || 0
  const y = Number(node.getAttribute('y')) || 0
  const width = Number(node.getAttribute('width')) || 0
  const height = Number(node.getAttribute('height')) || 0
  if (!matrix || !width || !height) return null
  const x1 = matrix.scaleX * x + matrix.translateX
  const x2 = matrix.scaleX * (x + width) + matrix.translateX
  const y1 = matrix.scaleY * y + matrix.translateY
  const y2 = matrix.scaleY * (y + height) + matrix.translateY
  const rect = { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1) }
  node.setAttribute('x', rect.x.toFixed(2))
  node.setAttribute('y', rect.y.toFixed(2))
  node.setAttribute('width', rect.width.toFixed(2))
  node.setAttribute('height', rect.height.toFixed(2))
  node.removeAttribute('transform')
  return { markup: new XMLSerializer().serializeToString(doc.documentElement), rect }
}

export function translateElements(rawMarkup, targetIds, delta) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const translate = `translate(${delta.x.toFixed(2)} ${delta.y.toFixed(2)})`
  targetIds.forEach((targetId) => {
    const node = doc.querySelector(`[data-editor-id="${targetId}"]`)
    if (!node) return
    const baseTransform = node.getAttribute('transform') || ''
    node.setAttribute('transform', baseTransform ? `${translate} ${baseTransform}` : translate)
  })
  return new XMLSerializer().serializeToString(doc.documentElement)
}

export function syncTextLineLayout(node) {
  if (node.tagName?.toLowerCase() !== 'text') return
  const configuredLineHeight = Number(node.getAttribute('line-height'))
  const lineHeight = Number.isFinite(configuredLineHeight) && configuredLineHeight > 0 ? configuredLineHeight : 1.2
  const fontSize = Number.parseFloat(node.getAttribute('font-size') || '16') || 16
  const lineHeightPx = lineHeight <= 10 ? lineHeight * fontSize : lineHeight
  const tspans = Array.from(node.children).filter((child) => child.tagName?.toLowerCase() === 'tspan')
  const lines = tspans.length > 1 ? tspans : (node.textContent || '').split(/\r?\n/)
  if (lines.length <= 1) return

  const x = node.getAttribute('x')
  if (tspans.length <= 1) {
    const text = node.textContent || ''
    node.replaceChildren()
    lines.forEach((line, index) => {
      const tspan = node.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'tspan')
      if (x != null) tspan.setAttribute('x', x)
      if (index > 0) tspan.setAttribute('dy', `${lineHeightPx}px`)
      tspan.textContent = line
      node.appendChild(tspan)
    })
    return
  }

  tspans.forEach((tspan, index) => {
    if (x != null && !tspan.hasAttribute('x')) tspan.setAttribute('x', x)
    if (index === 0) tspan.removeAttribute('dy')
    else tspan.setAttribute('dy', `${lineHeightPx}px`)
  })
}

export function getEditableTextContent(node) {
  if (!node) return ''
  const tspans = Array.from(node.children).filter((child) => child.tagName?.toLowerCase() === 'tspan')
  return tspans.length ? tspans.map((tspan) => tspan.textContent || '').join('\n') : (node.textContent || '')
}

function getStyleProperty(style, property) {
  const propertyPattern = new RegExp(`^\\s*${property}\\s*:\\s*(.+)$`, 'i')
  const rule = String(style || '').split(';').map((item) => item.match(propertyPattern)).find(Boolean)
  return rule?.[1].trim() || ''
}

function getStylesheetPaint(doc, node, property) {
  let value = ''
  doc.querySelectorAll('style').forEach((styleNode) => {
    const rulePattern = /([^{}]+)\{([^{}]*)\}/g
    let match
    while ((match = rulePattern.exec(styleNode.textContent || ''))) {
      const selector = match[1].trim()
      if (selector.startsWith('@')) continue
      const matchesNode = selector.split(',').some((candidate) => {
        try {
          return node.matches(candidate.trim())
        } catch {
          return false
        }
      })
      if (matchesNode) value = getStyleProperty(match[2], property) || value
    }
  })
  return value
}

function setStyleProperty(node, property, value) {
  const rules = String(node.getAttribute('style') || '').split(';').map((rule) => rule.trim()).filter(Boolean)
  const propertyPattern = new RegExp(`^\\s*${property}\\s*:`, 'i')
  const nextRules = rules.filter((rule) => !propertyPattern.test(rule))
  if (value !== '' && value != null) nextRules.push(`${property}: ${value}`)
  if (nextRules.length) node.setAttribute('style', nextRules.join('; '))
  else node.removeAttribute('style')
}

export function getElementPaint(rawMarkup, targetId, property) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const node = doc.querySelector(`[data-editor-id="${targetId}"]`)
  if (!node) return ''
  return getStyleProperty(node.getAttribute('style'), property)
    || getStylesheetPaint(doc, node, property)
    || node.getAttribute(property)
    || ''
}

export function updateElementAttributes(rawMarkup, targetId, updates) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const node = doc.querySelector(`[data-editor-id="${targetId}"]`)
  if (!node) return rawMarkup
  Object.entries(updates).forEach(([attribute, value]) => {
    const usesStylesheetPaint = node.tagName?.toLowerCase() === 'text' && attribute === 'fill' && Boolean(getStylesheetPaint(doc, node, attribute))
    if (usesStylesheetPaint) setStyleProperty(node, attribute, value)
    else if (value === '' || value == null) node.removeAttribute(attribute)
    else node.setAttribute(attribute, value)
  })
  if (node.tagName?.toLowerCase() === 'text' && 'fill' in updates && updates.fill && !updates.fill.startsWith('url(') && node.hasAttribute('data-editor-solid-fill')) {
    node.setAttribute('data-editor-solid-fill', updates.fill)
  }
  if (node.tagName?.toLowerCase() === 'text' && 'font-size' in updates) syncTextLineLayout(node)
  return new XMLSerializer().serializeToString(doc.documentElement)
}

function normalizeColorToken(value) {
  const color = String(value || '').trim()
  if (!color || color === 'none' || color.startsWith('url(')) return ''
  return color.startsWith('#') ? color.toUpperCase() : color
}

export function replaceSvgColorToken(rawMarkup, sourceColor, nextColor) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const source = normalizeColorToken(sourceColor)
  const replacement = normalizeColorToken(nextColor)
  const colorAttributes = ['fill', 'stroke', 'stop-color']
  if (!source || !replacement) return rawMarkup
  doc.querySelectorAll('[fill], [stroke], [stop-color], [style], [data-editor-solid-fill]').forEach((node) => {
    colorAttributes.forEach((attribute) => {
      if (normalizeColorToken(node.getAttribute(attribute)) === source) node.setAttribute(attribute, replacement)
    })
    if (normalizeColorToken(node.getAttribute('data-editor-solid-fill')) === source) node.setAttribute('data-editor-solid-fill', replacement)
    const style = node.getAttribute('style') || ''
    if (!style) return
    const nextStyle = style.split(';').map((rule) => {
      const [property, value] = rule.split(':')
      return /^\s*(fill|stroke|stop-color)\s*$/i.test(property || '') && normalizeColorToken(value) === source ? `${property}: ${replacement}` : rule
    }).join(';')
    node.setAttribute('style', nextStyle)
  })
  return new XMLSerializer().serializeToString(doc.documentElement)
}

function getTextGradientId(targetId) {
  return `vecsy-text-gradient-${targetId}`
}

function getFillGradientId(node) {
  const match = /^url\(\s*#([^\s)]+)\s*\)$/.exec(node.getAttribute('fill') || '')
  return match?.[1] || ''
}

function getGradientAngle(gradient) {
  const storedAngle = gradient.getAttribute('data-editor-angle')
  if (storedAngle != null && storedAngle !== '' && Number.isFinite(Number(storedAngle))) return Number(storedAngle)
  const parseCoordinate = (value, fallback) => {
    if (value == null || value === '') return fallback
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  const x1 = parseCoordinate(gradient.getAttribute('x1'), 0)
  const y1 = parseCoordinate(gradient.getAttribute('y1'), 0)
  const x2 = parseCoordinate(gradient.getAttribute('x2'), 1)
  const y2 = parseCoordinate(gradient.getAttribute('y2'), 0)
  if (x1 === x2 && y1 === y2) return 0
  return (Math.atan2(-(y2 - y1), x2 - x1) * 180 / Math.PI + 360) % 360
}

function getStopColor(stop, fallback) {
  if (stop.getAttribute('stop-color')) return stop.getAttribute('stop-color')
  const style = stop.getAttribute('style') || ''
  const colorRule = style.split(';').find((rule) => /^\s*stop-color\s*:/i.test(rule))
  return colorRule?.split(':').slice(1).join(':').trim() || fallback
}

export function getTextGradientConfig(rawMarkup, targetId) {
  try {
    const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
    const node = doc.querySelector(`[data-editor-id="${targetId}"]`)
    if (node?.tagName?.toLowerCase() !== 'text') return null
    const gradientId = getFillGradientId(node)
    const gradient = gradientId ? doc.getElementById(gradientId) : null
    const stops = gradient ? Array.from(gradient.querySelectorAll('stop')) : []
    if (gradient?.tagName?.toLowerCase() !== 'lineargradient' || stops.length < 2) return { enabled: false }
    return {
      startColor: getStopColor(stops[0], '#23211D'),
      endColor: getStopColor(stops[stops.length - 1], '#F2A93B'),
      angle: getGradientAngle(gradient),
      enabled: true,
    }
  } catch {
    return { enabled: false }
  }
}

export function updateTextGradient(rawMarkup, targetId, config) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const root = doc.documentElement
  const node = doc.querySelector(`[data-editor-id="${targetId}"]`)
  if (node?.tagName?.toLowerCase() !== 'text') return rawMarkup
  const gradientId = getTextGradientId(targetId)
  const existing = doc.querySelector(`linearGradient[id="${gradientId}"]`)
  if (!config?.enabled) {
    node.setAttribute('fill', node.getAttribute('data-editor-solid-fill') || '#23211D')
    return new XMLSerializer().serializeToString(root)
  }
  let defs = root.querySelector('defs')
  if (!defs) {
    defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs')
    root.insertBefore(defs, root.firstChild)
  }
  const gradient = existing || doc.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
  if (!existing) defs.appendChild(gradient)
  if (!node.hasAttribute('data-editor-solid-fill')) {
    const currentFill = node.getAttribute('fill') || ''
    node.setAttribute('data-editor-solid-fill', currentFill.startsWith('url(') ? config.startColor || '#23211D' : currentFill || '#23211D')
  }
  const angle = Number(config.angle) || 0
  const radians = angle * Math.PI / 180
  const x = Math.cos(radians)
  const y = -Math.sin(radians)
  gradient.setAttribute('id', gradientId)
  gradient.setAttribute('data-editor-angle', String(angle))
  gradient.setAttribute('x1', String((0.5 - x / 2).toFixed(4)))
  gradient.setAttribute('y1', String((0.5 - y / 2).toFixed(4)))
  gradient.setAttribute('x2', String((0.5 + x / 2).toFixed(4)))
  gradient.setAttribute('y2', String((0.5 + y / 2).toFixed(4)))
  gradient.replaceChildren()
  const stops = [[0, config.startColor], [1, config.endColor]]
  stops.forEach(([offset, color]) => {
    const stop = doc.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop.setAttribute('offset', String(offset))
    stop.setAttribute('stop-color', color)
    gradient.appendChild(stop)
  })
  node.setAttribute('fill', `url(#${gradientId})`)
  return new XMLSerializer().serializeToString(root)
}

export function resizeBackgroundLayer(rawMarkup, targetId, bounds) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const layer = doc.querySelector(`[data-editor-id="${targetId}"]`)
  const background = Array.from(layer?.children || []).find((node) => node.tagName === 'rect' && node.hasAttribute('fill'))
  if (!layer || !background) return rawMarkup
  const { minX, minY, width, height } = bounds
  background.setAttribute('x', minX.toFixed(2))
  background.setAttribute('y', minY.toFixed(2))
  background.setAttribute('width', width.toFixed(2))
  background.setAttribute('height', height.toFixed(2))
  layer.removeAttribute('transform')
  return new XMLSerializer().serializeToString(doc.documentElement)
}

export function formatSvgMarkup(rawMarkup) {
  const doc = new DOMParser().parseFromString(rawMarkup.trim(), 'image/svg+xml')
  if (doc.querySelector('parsererror') || doc.documentElement?.tagName?.toLowerCase() !== 'svg') throw new Error('Invalid SVG source.')
  const serialized = new XMLSerializer().serializeToString(doc.documentElement)
  const tokens = serialized.replace(/>\s+</g, '><').match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || []
  const lines = []
  let depth = 0
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index].trim()
    if (!token) continue
    if (!token.startsWith('<')) {
      const next = tokens[index + 1]?.trim()
      if (next?.startsWith('</') && lines.length) {
        lines[lines.length - 1] += token + next
        depth = Math.max(0, depth - 1)
        index += 1
      }
      continue
    }
    if (token.startsWith('</')) depth = Math.max(0, depth - 1)
    lines.push(`${'  '.repeat(depth)}${token}`)
    if (token.startsWith('<') && !token.startsWith('</') && !token.startsWith('<?') && !token.startsWith('<!') && !token.endsWith('/>')) depth += 1
  }
  return lines.join('\n')
}

function formatTransformNumber(value) {
  const formatted = Number(value.toFixed(12)).toString()
  return formatted === '-0' ? '0' : formatted
}

function compactTranslateRuns(transform) {
  const functionPattern = /([A-Za-z]+)\s*\(([^)]*)\)/g
  const numberPattern = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g
  const functions = []
  let match
  let cursor = 0
  while ((match = functionPattern.exec(transform))) {
    if (!/^[\s,]*$/.test(transform.slice(cursor, match.index))) return transform
    functions.push({ name: match[1], arguments: match[2] })
    cursor = functionPattern.lastIndex
  }
  if (!functions.length || !/^[\s,]*$/.test(transform.slice(cursor))) return transform

  let changed = false
  const compacted = []
  for (let index = 0; index < functions.length;) {
    const current = functions[index]
    if (current.name !== 'translate') {
      compacted.push(`${current.name}(${current.arguments})`)
      index += 1
      continue
    }

    const run = []
    while (functions[index]?.name === 'translate') {
      const values = functions[index].arguments.match(numberPattern)?.map(Number) || []
      const remainder = functions[index].arguments.replace(numberPattern, '').replace(/[\s,]/g, '')
      if (remainder || values.length < 1 || values.length > 2 || values.some((value) => !Number.isFinite(value))) break
      run.push(values)
      index += 1
    }
    if (!run.length) {
      compacted.push(`${current.name}(${current.arguments})`)
      index += 1
      continue
    }
    if (run.length === 1) {
      compacted.push(`translate(${current.arguments})`)
      continue
    }
    const [x, y] = run.reduce(([sumX, sumY], values) => [sumX + values[0], sumY + (values[1] || 0)], [0, 0])
    compacted.push(`translate(${formatTransformNumber(x)} ${formatTransformNumber(y)})`)
    changed = true
  }
  return changed ? compacted.join(' ') : transform
}

export function compactSvgTranslateTransforms(rawMarkup) {
  const doc = new DOMParser().parseFromString(rawMarkup.trim(), 'image/svg+xml')
  if (doc.querySelector('parsererror') || doc.documentElement?.tagName?.toLowerCase() !== 'svg') throw new Error('Invalid SVG source.')
  let changed = false
  doc.querySelectorAll('[transform]').forEach((node) => {
    const transform = node.getAttribute('transform') || ''
    const compacted = compactTranslateRuns(transform)
    if (compacted === transform) return
    node.setAttribute('transform', compacted)
    changed = true
  })
  return changed ? new XMLSerializer().serializeToString(doc.documentElement) : rawMarkup
}

export function highlightSvgSource(source) {
  const escapeHtml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const highlightTag = (rawTag) => {
    const nameMatch = rawTag.match(/^(\s*<\/?)([A-Za-z_][\w:.-]*)/)
    if (!nameMatch) return escapeHtml(rawTag)
    const output = [escapeHtml(nameMatch[1]), `<span class="syntax-tag">${escapeHtml(nameMatch[2])}</span>`]
    const rest = rawTag.slice(nameMatch[0].length)
    let cursor = 0
    const attributePattern = /([A-Za-z_:][\w:.-]*)(\s*=\s*)("[^"]*"|'[^']*')/g
    let match
    while ((match = attributePattern.exec(rest))) {
      output.push(escapeHtml(rest.slice(cursor, match.index)))
      output.push(`<span class="syntax-attribute">${escapeHtml(match[1])}</span>${escapeHtml(match[2])}<span class="syntax-value">${escapeHtml(match[3])}</span>`)
      cursor = match.index + match[0].length
    }
    output.push(escapeHtml(rest.slice(cursor)))
    return output.join('')
  }
  const tokens = source.match(/<!--[\s\S]*?-->|<[^>]*>|[^<]+/g) || []
  return tokens.map((token) => token.startsWith('<!--') ? `<span class="syntax-comment">${escapeHtml(token)}</span>` : token.startsWith('<') ? highlightTag(token) : escapeHtml(token)).join('')
}

export function createLayerMarkup(rawMarkup, tag, textContent = 'New text') {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const root = doc.documentElement
  const bounds = getSvgDimensions(doc)
  const centerX = bounds.x + bounds.width / 2
  const centerY = bounds.y + bounds.height / 2
  const newId = `node-new-${Date.now()}`
  const node = doc.createElementNS('http://www.w3.org/2000/svg', tag === 'heart' || tag === 'star' ? 'path' : tag)
  const attributes = {
    rect: { x: centerX - 100, y: centerY - 60, width: 200, height: 120, rx: 16, fill: '#F2A93B' },
    circle: { cx: centerX, cy: centerY, r: 72, fill: '#E8603F' },
    ellipse: { cx: centerX, cy: centerY, rx: 110, ry: 72, fill: '#8FA3C8' },
    line: { x1: centerX - 140, y1: centerY, x2: centerX + 140, y2: centerY, stroke: '#F2A93B', 'stroke-width': 12, 'stroke-linecap': 'round' },
    polyline: { points: `${centerX - 150},${centerY + 70} ${centerX - 50},${centerY - 80} ${centerX + 45},${centerY + 45} ${centerX + 150},${centerY - 65}`, fill: 'none', stroke: '#E8603F', 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    polygon: { points: createRegularPolygonPoints(centerX, centerY, 110, 3), fill: '#8FA3C8' },
    heart: { d: `M ${centerX} ${centerY + 104} C ${centerX - 146} ${centerY + 16}, ${centerX - 94} ${centerY - 112}, ${centerX} ${centerY - 36} C ${centerX + 94} ${centerY - 112}, ${centerX + 146} ${centerY + 16}, ${centerX} ${centerY + 104} Z`, fill: '#E8603F' },
    star: { d: createStarPath(centerX, centerY, 112, 48), fill: '#F2A93B' },
    path: { d: `M ${centerX - 125} ${centerY + 70} C ${centerX - 80} ${centerY - 115}, ${centerX + 80} ${centerY - 115}, ${centerX + 125} ${centerY + 70}`, fill: 'none', stroke: '#E8603F', 'stroke-width': 16, 'stroke-linecap': 'round' },
    text: { x: centerX, y: centerY, 'text-anchor': 'middle', 'font-family': 'Archivo, Arial, sans-serif', 'font-size': 48, 'font-weight': 700, fill: '#23211D' },
  }[tag] || { fill: '#F2A93B' }
  Object.entries(attributes).forEach(([attribute, value]) => node.setAttribute(attribute, String(value)))
  node.setAttribute('data-editor-id', newId)
  if (tag === 'heart') node.setAttribute('data-name', 'Heart')
  if (tag === 'star') node.setAttribute('data-name', 'Star')
  if (tag === 'text') node.textContent = textContent
  root.appendChild(doc.createTextNode('\n  '))
  root.appendChild(node)
  root.appendChild(doc.createTextNode('\n'))
  return { markup: new XMLSerializer().serializeToString(root), id: newId }
}

export function createCollectionSvgLayerMarkup(rawMarkup, { name, svgMarkup, preserveAppearance = false }) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const sourceDoc = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
  const sourceRoot = sourceDoc.documentElement
  if (sourceDoc.querySelector('parsererror') || sourceRoot?.tagName !== 'svg') throw new Error('Invalid SVG collection item.')
  const root = doc.documentElement
  const bounds = getSvgDimensions(doc)
  const viewBox = (sourceRoot.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number)
  const sourceWidth = viewBox.length === 4 && viewBox.every(Number.isFinite) ? viewBox[2] : Number(sourceRoot.getAttribute('width')) || 24
  const sourceHeight = viewBox.length === 4 && viewBox.every(Number.isFinite) ? viewBox[3] : Number(sourceRoot.getAttribute('height')) || 24
  const size = Math.min(bounds.width, bounds.height) * 0.32
  const scale = size / Math.max(sourceWidth, sourceHeight)
  const newId = `node-new-${Date.now()}`
  const node = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  const x = bounds.x + (bounds.width - sourceWidth * scale) / 2 - (viewBox[0] || 0) * scale
  const y = bounds.y + (bounds.height - sourceHeight * scale) / 2 - (viewBox[1] || 0) * scale
  node.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(4)})`)
  if (!preserveAppearance) node.setAttribute('fill', '#23211D')
  node.setAttribute('data-editor-id', newId)
  node.setAttribute('data-editor-collection-icon', '')
  node.setAttribute('data-name', name)
  Array.from(sourceRoot.children).forEach((child) => {
    if (['script', 'foreignObject'].includes(child.tagName)) return
    const imported = doc.importNode(child, true)
    if (!preserveAppearance) {
      imported.querySelectorAll?.('[fill]').forEach((element) => {
        if (element.getAttribute('fill') !== 'none') element.removeAttribute('fill')
      })
      if (imported.hasAttribute('fill') && imported.getAttribute('fill') !== 'none') imported.removeAttribute('fill')
    }
    node.appendChild(imported)
  })
  root.appendChild(doc.createTextNode('\n  '))
  root.appendChild(node)
  root.appendChild(doc.createTextNode('\n'))
  return { markup: new XMLSerializer().serializeToString(root), id: newId }
}

export function createImageLayerMarkup(rawMarkup, { name, href, width, height }) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const root = doc.documentElement
  const bounds = getSvgDimensions(doc)
  const sourceWidth = Math.max(1, Number(width) || 1)
  const sourceHeight = Math.max(1, Number(height) || 1)
  const size = Math.min(bounds.width, bounds.height) * 0.32
  const scale = Math.min(size / sourceWidth, size / sourceHeight)
  const imageWidth = sourceWidth * scale
  const imageHeight = sourceHeight * scale
  const node = doc.createElementNS('http://www.w3.org/2000/svg', 'image')
  const newId = `node-new-${Date.now()}`
  node.setAttribute('x', (bounds.x + (bounds.width - imageWidth) / 2).toFixed(2))
  node.setAttribute('y', (bounds.y + (bounds.height - imageHeight) / 2).toFixed(2))
  node.setAttribute('width', imageWidth.toFixed(2))
  node.setAttribute('height', imageHeight.toFixed(2))
  node.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  node.setAttribute('href', href)
  node.setAttribute('data-editor-id', newId)
  node.setAttribute('data-name', name)
  root.appendChild(doc.createTextNode('\n  '))
  root.appendChild(node)
  root.appendChild(doc.createTextNode('\n'))
  return { markup: new XMLSerializer().serializeToString(root), id: newId }
}

function parsePolygonPoints(pointsValue) {
  const values = String(pointsValue || '').match(/[-+]?(?:\d*\.\d+|\d+)(?:e[-+]?\d+)?/gi)?.map(Number) || []
  const points = []
  for (let index = 0; index + 1 < values.length; index += 2) points.push({ x: values[index], y: values[index + 1] })
  return points
}

function createRegularPolygonPoints(centerX, centerY, radius, sides, startAngle = -Math.PI / 2) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = startAngle + index * Math.PI * 2 / sides
    return `${(centerX + Math.cos(angle) * radius).toFixed(2)},${(centerY + Math.sin(angle) * radius).toFixed(2)}`
  }).join(' ')
}

function createStarPath(centerX, centerY, outerRadius, innerRadius) {
  return Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + index * Math.PI / 5
    const radius = index % 2 ? innerRadius : outerRadius
    const x = (centerX + Math.cos(angle) * radius).toFixed(2)
    const y = (centerY + Math.sin(angle) * radius).toFixed(2)
    return `${index ? 'L' : 'M'} ${x} ${y}`
  }).join(' ') + ' Z'
}

export function getPolygonSides(pointsValue) {
  return parsePolygonPoints(pointsValue).length
}

export function updatePolygonSides(rawMarkup, targetId, sides) {
  const count = Math.max(3, Math.round(Number(sides) || 3))
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const node = doc.querySelector(`[data-editor-id="${targetId}"]`)
  if (!node || node.tagName !== 'polygon') return rawMarkup
  const points = parsePolygonPoints(node.getAttribute('points'))
  if (points.length < 3) return rawMarkup
  const centerX = points.reduce((total, point) => total + point.x, 0) / points.length
  const centerY = points.reduce((total, point) => total + point.y, 0) / points.length
  const radius = points.reduce((total, point) => total + Math.hypot(point.x - centerX, point.y - centerY), 0) / points.length
  const startAngle = Math.atan2(points[0].y - centerY, points[0].x - centerX)
  node.setAttribute('points', createRegularPolygonPoints(centerX, centerY, radius, count, startAngle))
  return new XMLSerializer().serializeToString(doc.documentElement)
}

export function copyLayerMarkup(rawMarkup, targetId) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const node = doc.querySelector(`[data-editor-id="${targetId}"]`)
  return node ? new XMLSerializer().serializeToString(node) : ''
}

export function insertClonedLayer(rawMarkup, sourceMarkup, targetId, pastedId) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const target = doc.querySelector(`[data-editor-id="${targetId}"]`)
  const sourceDoc = new DOMParser().parseFromString(sourceMarkup, 'image/svg+xml')
  const source = sourceDoc.documentElement
  if (!target || !source) return rawMarkup
  const clone = source.cloneNode(true)
  clone.querySelectorAll('[data-editor-id]').forEach((node) => node.removeAttribute('data-editor-id'))
  clone.setAttribute('data-editor-id', pastedId)
  const usedIds = new Set(Array.from(doc.querySelectorAll('[id]')).map((node) => node.getAttribute('id')).filter(Boolean))
  const clonedNodes = [clone, ...clone.querySelectorAll('[id]')]
  clonedNodes.forEach((node) => {
    const originalId = node.getAttribute('id')
    if (!originalId) return
    let nextId = `${originalId}-copy`
    let suffix = 2
    while (usedIds.has(nextId)) nextId = `${originalId}-copy-${suffix++}`
    node.setAttribute('id', nextId)
    usedIds.add(nextId)
  })
  const parent = target.parentElement || doc.documentElement
  parent.insertBefore(clone, target.nextSibling)
  return new XMLSerializer().serializeToString(doc.documentElement)
}

export function removeLayer(rawMarkup, targetId) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const node = doc.querySelector(`[data-editor-id="${targetId}"]`)
  if (!node || node === doc.documentElement) return { markup: rawMarkup, nextSelectedId: targetId }
  const parent = node.parentElement
  const siblings = Array.from(parent?.children || []).filter((child) => child !== node && EDITABLE_TAGS.has(child.tagName))
  const nodeIndex = Array.from(parent?.children || []).indexOf(node)
  const nextSibling = siblings.find((sibling) => Array.from(parent.children).indexOf(sibling) > nodeIndex) || siblings[siblings.length - 1]
  const nextSelectedId = nextSibling?.getAttribute('data-editor-id') || parent?.getAttribute('data-editor-id') || ''
  node.remove()
  return { markup: new XMLSerializer().serializeToString(doc.documentElement), nextSelectedId }
}

export function removeLayers(rawMarkup, targetIds) {
  if (!targetIds.length) return { markup: rawMarkup, nextSelectedId: '' }
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const selectedIds = new Set(targetIds)
  const nodes = targetIds.map((targetId) => doc.querySelector(`[data-editor-id="${targetId}"]`)).filter((node) => node && node !== doc.documentElement)
  const topLevelNodes = nodes.filter((node) => {
    let parent = node.parentElement
    while (parent) {
      if (selectedIds.has(parent.getAttribute('data-editor-id'))) return false
      parent = parent.parentElement
    }
    return true
  })
  if (!topLevelNodes.length) return { markup: rawMarkup, nextSelectedId: '' }
  topLevelNodes.forEach((node) => node.remove())
  const nextSelectedId = doc.querySelector('[data-editor-id]')?.getAttribute('data-editor-id') || ''
  return { markup: new XMLSerializer().serializeToString(doc.documentElement), nextSelectedId }
}

export function groupLayers(rawMarkup, targetIds) {
  if (targetIds.length < 2) return { markup: rawMarkup, nextSelectedId: '' }
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const selectedIds = new Set(targetIds)
  const nodes = targetIds.map((targetId) => doc.querySelector(`[data-editor-id="${targetId}"]`)).filter((node) => node && node !== doc.documentElement)
  const topLevelNodes = nodes.filter((node) => {
    let parent = node.parentElement
    while (parent) {
      if (selectedIds.has(parent.getAttribute('data-editor-id'))) return false
      parent = parent.parentElement
    }
    return true
  })
  const parent = topLevelNodes[0]?.parentElement
  if (topLevelNodes.length < 2 || !parent || topLevelNodes.some((node) => node.parentElement !== parent)) return { markup: rawMarkup, nextSelectedId: '' }
  const sortedNodes = [...topLevelNodes].sort((left, right) => Array.from(parent.children).indexOf(left) - Array.from(parent.children).indexOf(right))
  const usedIds = new Set(Array.from(doc.querySelectorAll('[data-editor-id]')).map((node) => node.getAttribute('data-editor-id')))
  let index = 0
  while (usedIds.has(`group-${index}`)) index += 1
  const groupId = `group-${index}`
  const group = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
  group.setAttribute('data-editor-id', groupId)
  group.setAttribute('data-name', 'Group')
  parent.insertBefore(group, sortedNodes[0])
  sortedNodes.forEach((node) => group.appendChild(node))
  return { markup: new XMLSerializer().serializeToString(doc.documentElement), nextSelectedId: groupId }
}

export function reorderSiblingElements(rawMarkup, draggedId, targetId) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const dragged = doc.querySelector(`[data-editor-id="${draggedId}"]`)
  const target = doc.querySelector(`[data-editor-id="${targetId}"]`)
  if (!dragged || !target || dragged === target || dragged.parentElement !== target.parentElement) return rawMarkup
  target.parentElement.insertBefore(dragged, target)
  return new XMLSerializer().serializeToString(doc.documentElement)
}

export function sanitizeForExport(rawMarkup) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  doc.querySelectorAll('[data-editor-id]').forEach((node) => node.removeAttribute('data-editor-id'))
  doc.querySelectorAll('[data-editor-collection-icon]').forEach((node) => node.removeAttribute('data-editor-collection-icon'))
  doc.querySelectorAll('[data-editor-original-width], [data-editor-original-height]').forEach((node) => {
    node.removeAttribute('data-editor-original-width')
    node.removeAttribute('data-editor-original-height')
  })
  return new XMLSerializer().serializeToString(doc.documentElement)
}

export function filterSvgToLayerIds(rawMarkup, layerIds) {
  if (!layerIds.length) return rawMarkup
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const selectedIds = new Set(layerIds)
  const keepSelectedLayers = (node) => {
    Array.from(node.children).forEach((child) => {
      const id = child.getAttribute('data-editor-id')
      if (id && selectedIds.has(id)) return
      if (id) {
        const hasSelectedDescendant = child.querySelector('[data-editor-id]') && Array.from(child.querySelectorAll('[data-editor-id]')).some((descendant) => selectedIds.has(descendant.getAttribute('data-editor-id')))
        if (!hasSelectedDescendant) {
          child.remove()
          return
        }
      }
      keepSelectedLayers(child)
    })
  }
  keepSelectedLayers(doc.documentElement)
  return new XMLSerializer().serializeToString(doc.documentElement)
}

export function cropSvgToBounds(rawMarkup, bounds) {
  if (!bounds?.width || !bounds?.height) return rawMarkup
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const root = doc.documentElement
  root.setAttribute('viewBox', `${bounds.minX.toFixed(2)} ${bounds.minY.toFixed(2)} ${bounds.width.toFixed(2)} ${bounds.height.toFixed(2)}`)
  root.removeAttribute('width')
  root.removeAttribute('height')
  return new XMLSerializer().serializeToString(root)
}

export function minifySvg(rawMarkup) {
  return rawMarkup.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').replace(/\d*\.\d{3,}/g, (match) => String(Number(Number(match).toFixed(2)))).trim()
}

export function withExplicitSize(rawMarkup, width, height) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  if (!doc.documentElement.hasAttribute('width')) doc.documentElement.setAttribute('width', String(width))
  if (!doc.documentElement.hasAttribute('height')) doc.documentElement.setAttribute('height', String(height))
  return new XMLSerializer().serializeToString(doc.documentElement)
}

export function translateElementsById(rawMarkup, moves) {
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  moves.forEach(({ id, dx, dy }) => {
    if (!dx && !dy) return
    const node = doc.querySelector(`[data-editor-id="${id}"]`)
    if (!node) return
    const translate = `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`
    const baseTransform = node.getAttribute('transform') || ''
    node.setAttribute('transform', baseTransform ? `${translate} ${baseTransform}` : translate)
  })
  return new XMLSerializer().serializeToString(doc.documentElement)
}

export function highlightSelectedMarkup(rawMarkup, editingTextId = '') {
  if (!editingTextId) return rawMarkup
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const node = doc.querySelector(`[data-editor-id="${editingTextId}"]`)
  if (!node) return rawMarkup
  const classNames = new Set((node.getAttribute('class') || '').split(/\s+/).filter(Boolean))
  classNames.add('is-editing-text')
  node.setAttribute('class', [...classNames].join(' '))
  return new XMLSerializer().serializeToString(doc.documentElement)
}
