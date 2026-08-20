import { groupLayers, insertBasicShape, removeLayers, scaleElementAroundCenter, translateElements, translateElementsById, updateElementAttributes, updateElementTextContent, updateElementTransform } from './svg-transforms.js'

/**
 * Applies one user-intent transaction to SVG markup. This boundary is pure:
 * it never reads UI state and never commits history.
 */
export function editSvgDocument(markup, transaction) {
  let result = { markup, nextSelectedId: '', nextSelectedIds: undefined }

  switch (transaction.type) {
    case 'set-attributes':
      result.markup = updateElementAttributes(markup, transaction.targetId, transaction.updates)
      result.nextSelectedId = transaction.targetId
      break
    case 'set-transform':
      result.markup = updateElementTransform(markup, transaction.targetId, transaction.transform)
      result.nextSelectedId = transaction.targetId
      break
    case 'translate':
      result.markup = translateElements(markup, transaction.targetIds, transaction.delta)
      result.nextSelectedId = transaction.selectedId || transaction.targetIds[0] || ''
      result.nextSelectedIds = transaction.selectedIds || transaction.targetIds
      break
    case 'translate-by-id':
      result.markup = translateElementsById(markup, transaction.moves)
      result.nextSelectedId = transaction.selectedId || transaction.moves[0]?.id || ''
      result.nextSelectedIds = transaction.selectedIds || transaction.moves.map((move) => move.id)
      break
    case 'group': {
      const grouped = groupLayers(markup, transaction.targetIds)
      result = { markup: grouped.markup, nextSelectedId: grouped.nextSelectedId, nextSelectedIds: grouped.nextSelectedId ? [grouped.nextSelectedId] : [] }
      break
    }
    case 'remove': {
      const removed = removeLayers(markup, transaction.targetIds)
      result = { markup: removed.markup, nextSelectedId: removed.nextSelectedId, nextSelectedIds: removed.nextSelectedId ? [removed.nextSelectedId] : [] }
      break
    }
    case 'resize':
      result.markup = scaleElementAroundCenter(markup, transaction.targetId, transaction.scale)
      result.nextSelectedId = transaction.targetId
      result.nextSelectedIds = [transaction.targetId]
      break
    case 'replace-text':
      result.markup = updateElementTextContent(markup, transaction.targetId, transaction.text)
      result.nextSelectedId = transaction.targetId
      result.nextSelectedIds = [transaction.targetId]
      break
    case 'insert-shape':
      result.markup = insertBasicShape(markup, transaction.shape)
      result.nextSelectedId = transaction.shape.id
      result.nextSelectedIds = [transaction.shape.id]
      break
    default:
      throw new Error(`Unsupported SVG transaction: ${transaction.type}`)
  }

  return { ...result, changed: result.markup !== markup }
}
