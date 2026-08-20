import { ATTRIBUTE_ALLOWLIST, DesignActionError, ERROR_CODES, INSERTABLE_TAGS, RESIZABLE_TAGS, STYLE_PROPERTIES, VDAP_INTENT, VDAP_VERSION, assertExactKeys, invalidAction, isFiniteSvgNumber, isSafeColor } from './design-action-schema.js'

function assertTargetIds(action, context) {
  if (!Array.isArray(action.targetIds) || !action.targetIds.length || action.targetIds.some((id) => typeof id !== 'string')) throw invalidAction('targetIds must be a non-empty string array.')
  action.targetIds.forEach((id) => {
    if (!context.availableIds.includes(id)) throw new DesignActionError(ERROR_CODES.UNKNOWN_TARGET)
    if (!context.selectedIds.includes(id)) throw new DesignActionError(ERROR_CODES.OUT_OF_SELECTION_TARGET)
  })
}

function assertNumber(value, options) {
  if (!isFiniteSvgNumber(value, options)) throw invalidAction('Invalid numeric value.')
}

function assertAttributes(tag, attributes) {
  assertExactKeys(attributes, ATTRIBUTE_ALLOWLIST[tag] || [])
  if (!Object.keys(attributes).length) throw invalidAction('attributes must not be empty.')
  Object.entries(attributes).forEach(([name, value]) => {
    if (name === 'points') {
      if (typeof value !== 'string' || !value.trim()) throw invalidAction('Invalid points value.')
      return
    }
    assertNumber(value)
    if (['width', 'height', 'r', 'rx', 'ry', 'font-size'].includes(name) && value < 0) throw invalidAction('Negative size is not allowed.')
  })
}

function assertStyle(properties) {
  assertExactKeys(properties, Object.keys(STYLE_PROPERTIES))
  if (!Object.keys(properties).length) throw invalidAction('properties must not be empty.')
  Object.entries(properties).forEach(([name, value]) => {
    if (name === 'fill' || name === 'stroke') {
      if (!isSafeColor(value)) throw invalidAction('Invalid color.')
    } else if (name === 'strokeLinecap') {
      if (!['butt', 'round', 'square'].includes(value)) throw invalidAction('Invalid stroke line cap.')
    } else if (name === 'strokeLinejoin') {
      if (!['miter', 'round', 'bevel'].includes(value)) throw invalidAction('Invalid stroke line join.')
    } else if (name === 'opacity' || name === 'fillOpacity' || name === 'strokeOpacity') {
      assertNumber(value, { minimum: 0, maximum: 1 })
    } else {
      assertNumber(value, { minimum: 0, maximum: 10000 })
    }
  })
}

function selectionById(context, id) {
  return context.selection.find((item) => item.id === id)
}

function validateAction(action, context) {
  if (!action || typeof action !== 'object' || Array.isArray(action) || typeof action.type !== 'string') throw invalidAction('Invalid action.')
  switch (action.type) {
    case 'set-style':
      assertExactKeys(action, ['type', 'targetIds', 'properties'])
      assertTargetIds(action, context)
      assertStyle(action.properties)
      break
    case 'set-attributes':
      assertExactKeys(action, ['type', 'targetIds', 'attributes'])
      assertTargetIds(action, context)
      action.targetIds.forEach((id) => assertAttributes(selectionById(context, id)?.tag, action.attributes))
      break
    case 'move':
      assertExactKeys(action, ['type', 'targetIds', 'delta'])
      assertTargetIds(action, context)
      assertExactKeys(action.delta, ['x', 'y'])
      assertNumber(action.delta.x)
      assertNumber(action.delta.y)
      break
    case 'resize':
      assertExactKeys(action, ['type', 'targetIds', 'scale', 'anchor'])
      assertTargetIds(action, context)
      if (action.anchor !== 'center') throw invalidAction('Only center resize is supported.')
      assertNumber(action.scale, { minimum: 0.1, maximum: 10 })
      action.targetIds.forEach((id) => {
        if (!RESIZABLE_TAGS.has(selectionById(context, id)?.tag)) throw invalidAction('Target cannot be resized.')
      })
      break
    case 'replace-text':
      assertExactKeys(action, ['type', 'targetIds', 'text'])
      assertTargetIds(action, context)
      if (typeof action.text !== 'string' || action.text.length > 2000) throw invalidAction('Invalid text value.')
      action.targetIds.forEach((id) => {
        if (selectionById(context, id)?.tag !== 'text') throw invalidAction('replace-text requires text targets.')
      })
      break
    case 'remove':
      assertExactKeys(action, ['type', 'targetIds'])
      assertTargetIds(action, context)
      break
    case 'group': {
      assertExactKeys(action, ['type', 'targetIds'])
      assertTargetIds(action, context)
      if (action.targetIds.length < 2) throw invalidAction('group requires at least two targets.')
      const parents = new Set(action.targetIds.map((id) => selectionById(context, id)?.parentId))
      if (parents.size !== 1) throw invalidAction('group targets must be siblings.')
      break
    }
    case 'insert-shape':
      assertExactKeys(action, ['type', 'shape', 'parentId'])
      if (action.parentId !== null) throw invalidAction('Only root insertion is supported.')
      assertExactKeys(action.shape, ['tag', 'attributes', 'text'])
      if (!INSERTABLE_TAGS.has(action.shape.tag)) throw invalidAction('Unsupported inserted shape.')
      if (action.shape.tag !== 'text' && action.shape.text !== undefined) throw invalidAction('Only text shapes may include text.')
      if (action.shape.tag === 'text' && action.shape.text !== undefined && (typeof action.shape.text !== 'string' || action.shape.text.length > 2000)) throw invalidAction('Invalid text value.')
      assertAttributes(action.shape.tag, action.shape.attributes)
      break
    default:
      throw invalidAction('Unsupported action type.')
  }
}

export function validateDesignActions(envelope, context) {
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) throw new DesignActionError(ERROR_CODES.INVALID_RESPONSE)
  assertExactKeys(envelope, ['version', 'intent', 'summary', 'actions'])
  if (envelope.version !== VDAP_VERSION) throw new DesignActionError(ERROR_CODES.UNSUPPORTED_PROTOCOL_VERSION)
  if (envelope.intent !== VDAP_INTENT) throw invalidAction('Unsupported intent.')
  if (typeof envelope.summary !== 'string' || !envelope.summary.trim() || envelope.summary.length > 300) throw invalidAction('Invalid summary.')
  if (!Array.isArray(envelope.actions) || !envelope.actions.length || envelope.actions.length > 30) throw invalidAction('Invalid actions.')
  if (!context?.selection?.length) throw invalidAction('Selection is required.')
  envelope.actions.forEach((action) => validateAction(action, context))
  return envelope.actions
}
