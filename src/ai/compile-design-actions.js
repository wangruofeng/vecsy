import { STYLE_PROPERTIES } from './design-action-schema.js'

function nextEditorId(usedIds) {
  let index = 0
  while (usedIds.has(`node-ai-${index}`)) index += 1
  const id = `node-ai-${index}`
  usedIds.add(id)
  return id
}

function styleUpdates(properties) {
  return Object.fromEntries(Object.entries(properties).map(([name, value]) => [STYLE_PROPERTIES[name], value]))
}

export function compileDesignActions(actions, context) {
  const usedIds = new Set(context.availableIds)
  return actions.flatMap((action) => {
    switch (action.type) {
      case 'set-style':
        return action.targetIds.map((targetId) => ({ type: 'set-attributes', targetId, updates: styleUpdates(action.properties) }))
      case 'set-attributes':
        return action.targetIds.map((targetId) => ({ type: 'set-attributes', targetId, updates: action.attributes }))
      case 'move':
        return [{ type: 'translate', targetIds: action.targetIds, selectedId: action.targetIds.at(-1), selectedIds: action.targetIds, delta: action.delta }]
      case 'resize':
        return action.targetIds.map((targetId) => ({ type: 'resize', targetId, scale: action.scale }))
      case 'replace-text':
        return action.targetIds.map((targetId) => ({ type: 'replace-text', targetId, text: action.text }))
      case 'remove':
        return [{ type: 'remove', targetIds: action.targetIds }]
      case 'group':
        return [{ type: 'group', targetIds: action.targetIds }]
      case 'insert-shape':
        return [{ type: 'insert-shape', shape: { ...action.shape, id: nextEditorId(usedIds), text: action.shape.text || '' } }]
      default:
        return []
    }
  })
}
