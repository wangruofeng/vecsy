const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const BLOCKED_ELEMENTS = new Set(['script', 'foreignobject', 'iframe', 'object', 'embed', 'audio', 'video'])
const URL_ATTRIBUTES = new Set(['href', 'src', 'xlink:href'])
const SAFE_RASTER_DATA_URL = /^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/=\s]+$/i

function reject(message) {
  return { status: 'rejected', markup: '', warnings: [message], removedFeatures: {}, source: 'untrusted' }
}

function record(removedFeatures, feature) {
  removedFeatures[feature] = (removedFeatures[feature] || 0) + 1
}

function isSafeUrl(value) {
  const normalized = String(value || '').trim()
  return normalized.startsWith('#') || SAFE_RASTER_DATA_URL.test(normalized)
}

function hasUnsafeUrlReference(value) {
  const references = [...String(value || '').matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)]
  return references.some((match) => !isSafeUrl(match[2]))
}

function sanitizeStyleAttribute(node, removedFeatures) {
  const style = node.getAttribute('style')
  if (!style) return
  if (hasUnsafeUrlReference(style) || /@(?:import|font-face)\b/i.test(style)) {
    node.removeAttribute('style')
    record(removedFeatures, 'unsafe-style')
  }
}

function sanitizeStyleElement(node, removedFeatures) {
  const css = node.textContent || ''
  if (hasUnsafeUrlReference(css) || /@(?:import|font-face)\b/i.test(css)) {
    node.remove()
    record(removedFeatures, 'unsafe-style')
  }
}

function sanitizeAttributes(node, removedFeatures) {
  Array.from(node.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase()
    const value = attribute.value
    if (node.localName?.toLowerCase() === 'a' && URL_ATTRIBUTES.has(name)) {
      node.removeAttribute(attribute.name)
      record(removedFeatures, 'link')
      return
    }
    if (name.startsWith('on')) {
      node.removeAttribute(attribute.name)
      record(removedFeatures, 'event-handler')
      return
    }
    if (URL_ATTRIBUTES.has(name) && !isSafeUrl(value)) {
      node.removeAttribute(attribute.name)
      record(removedFeatures, 'external-url')
      return
    }
    if (hasUnsafeUrlReference(value)) {
      node.removeAttribute(attribute.name)
      record(removedFeatures, 'external-url')
    }
  })
  sanitizeStyleAttribute(node, removedFeatures)
}

/**
 * Parses and sanitizes SVG markup before it can reach an inline SVG preview.
 * App-owned assets may keep their animation styles, while every other source
 * gets the stricter no-style policy defined by the v0.5 threat model.
 */
export function processSvgInput(rawMarkup, { source = 'untrusted' } = {}) {
  if (typeof rawMarkup !== 'string' || !rawMarkup.trim()) return reject('empty-svg')
  const doc = new DOMParser().parseFromString(rawMarkup, 'image/svg+xml')
  const root = doc.documentElement
  if (doc.querySelector('parsererror') || !root || root.localName?.toLowerCase() !== 'svg' || root.namespaceURI !== SVG_NAMESPACE) return reject('invalid-svg')

  const removedFeatures = {}
  Array.from(doc.childNodes).forEach((node) => {
    if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
      node.remove()
      record(removedFeatures, 'processing-instruction')
    }
  })
  Array.from(root.querySelectorAll('*')).forEach((node) => {
    const tagName = node.localName.toLowerCase()
    if (BLOCKED_ELEMENTS.has(tagName) || (source !== 'app-owned' && tagName === 'style')) {
      node.remove()
      record(removedFeatures, tagName === 'style' ? 'style-element' : 'blocked-element')
      return
    }
    if (tagName === 'style') {
      sanitizeStyleElement(node, removedFeatures)
      return
    }
    sanitizeAttributes(node, removedFeatures)
  })
  sanitizeAttributes(root, removedFeatures)

  return {
    status: Object.keys(removedFeatures).length ? 'sanitized' : 'accepted',
    markup: new XMLSerializer().serializeToString(root),
    warnings: Object.keys(removedFeatures),
    removedFeatures,
    source,
  }
}
