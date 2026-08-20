import { DesignActionError, ERROR_CODES, RESIZABLE_TAGS } from './design-action-schema.js'

export const QUICK_ACTIONS = ['blue', 'larger', 'rounded', 'remove']

function selectedIdsFor(context, predicate = () => true) {
  return context.selection.filter(predicate).map((item) => item.id)
}

function noSupportedSelection() {
  throw new DesignActionError(ERROR_CODES.INVALID_ACTION, 'No selected elements support this action.')
}

export function createDemoEnvelope(actionId, context, summary) {
  const selectedIds = selectedIdsFor(context)
  if (!selectedIds.length) noSupportedSelection()
  switch (actionId) {
    case 'blue':
      return { version: '1.0', intent: 'edit-selection', summary: summary || 'Apply blue fill to the selection', actions: [{ type: 'set-style', targetIds: selectedIds, properties: { fill: '#6366F1' } }] }
    case 'larger': {
      const targetIds = selectedIdsFor(context, (item) => RESIZABLE_TAGS.has(item.tag))
      if (!targetIds.length) noSupportedSelection()
      return { version: '1.0', intent: 'edit-selection', summary: summary || 'Make the selected elements larger', actions: [{ type: 'resize', targetIds, scale: 1.25, anchor: 'center' }] }
    }
    case 'rounded': {
      const targetIds = selectedIdsFor(context, (item) => item.tag === 'rect')
      if (!targetIds.length) noSupportedSelection()
      return { version: '1.0', intent: 'edit-selection', summary: summary || 'Round the selected rectangles', actions: [{ type: 'set-attributes', targetIds, attributes: { rx: 12, ry: 12 } }] }
    }
    case 'remove':
      return { version: '1.0', intent: 'edit-selection', summary: summary || 'Remove the selected elements', actions: [{ type: 'remove', targetIds: selectedIds }] }
    default:
      throw new DesignActionError(ERROR_CODES.PROVIDER_NOT_CONFIGURED)
  }
}

export function demoActionFromPrompt(prompt, context) {
  const normalized = prompt.trim().toLowerCase()
  const actionId = ({ blue: 'blue', 'make blue': 'blue', larger: 'larger', 'make larger': 'larger', rounded: 'rounded', 'more rounded': 'rounded', remove: 'remove' })[normalized]
  if (!actionId) throw new DesignActionError(ERROR_CODES.PROVIDER_NOT_CONFIGURED)
  return createDemoEnvelope(actionId, context)
}
