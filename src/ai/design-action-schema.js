export const VDAP_VERSION = '1.0'
export const VDAP_INTENT = 'edit-selection'

export const ERROR_CODES = {
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  UNSUPPORTED_PROTOCOL_VERSION: 'UNSUPPORTED_PROTOCOL_VERSION',
  INVALID_ACTION: 'INVALID_ACTION',
  UNKNOWN_TARGET: 'UNKNOWN_TARGET',
  OUT_OF_SELECTION_TARGET: 'OUT_OF_SELECTION_TARGET',
  DOCUMENT_CHANGED: 'DOCUMENT_CHANGED',
  PROVIDER_NOT_CONFIGURED: 'PROVIDER_NOT_CONFIGURED',
}

export const STYLE_PROPERTIES = {
  fill: 'fill',
  stroke: 'stroke',
  strokeWidth: 'stroke-width',
  opacity: 'opacity',
  fillOpacity: 'fill-opacity',
  strokeOpacity: 'stroke-opacity',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
}

export const ATTRIBUTE_ALLOWLIST = {
  rect: new Set(['x', 'y', 'width', 'height', 'rx', 'ry']),
  circle: new Set(['cx', 'cy', 'r']),
  ellipse: new Set(['cx', 'cy', 'rx', 'ry']),
  line: new Set(['x1', 'y1', 'x2', 'y2']),
  polygon: new Set(['points']),
  polyline: new Set(['points']),
  text: new Set(['x', 'y', 'dx', 'dy', 'font-size']),
}

export const INSERTABLE_TAGS = new Set(['rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'text'])
export const RESIZABLE_TAGS = new Set(['rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'text'])

export class DesignActionError extends Error {
  constructor(code, message = code) {
    super(message)
    this.name = 'DesignActionError'
    this.code = code
  }
}

export function invalidAction(message) {
  return new DesignActionError(ERROR_CODES.INVALID_ACTION, message)
}

export function isFiniteSvgNumber(value, { minimum = -1000000, maximum = 1000000 } = {}) {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum
}

export function isSafeColor(value) {
  if (typeof value !== 'string') return false
  const color = value.trim()
  if (!color || /(?:url\s*\(|javascript:|data:|\/\*)/i.test(color)) return false
  if (/^#[0-9a-f]{3,8}$/i.test(color)) return true
  if (color === 'none' || color === 'currentColor') return true
  const match = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i.exec(color)
  return Boolean(match && match.slice(1, 4).every((part) => Number(part) <= 255))
}

export function assertExactKeys(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalidAction('Expected an object.')
  const allowed = new Set(keys)
  if (Object.keys(value).some((key) => !allowed.has(key))) throw invalidAction('Unknown field.')
}
