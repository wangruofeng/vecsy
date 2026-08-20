import { editSvgDocument } from '../editor/edit-svg-document.js'
import { parseSvg } from '../editor/svg-parser.js'
import { compileDesignActions } from './compile-design-actions.js'
import { validateDesignActions } from './validate-design-actions.js'

export function executeDesignActions(markup, envelope, context) {
  const actions = validateDesignActions(envelope, context)
  const transactions = compileDesignActions(actions, context)
  let nextMarkup = markup
  let nextSelectedId = ''
  let nextSelectedIds = []
  const affectedIds = new Set()
  transactions.forEach((transaction) => {
    const result = editSvgDocument(nextMarkup, transaction)
    nextMarkup = result.markup
    nextSelectedId = result.nextSelectedId || nextSelectedId
    nextSelectedIds = result.nextSelectedIds || nextSelectedIds
    if (transaction.targetId) affectedIds.add(transaction.targetId)
    transaction.targetIds?.forEach((id) => affectedIds.add(id))
    if (transaction.shape?.id) affectedIds.add(transaction.shape.id)
  })
  const parsed = parseSvg(nextMarkup)
  return {
    markup: parsed.markup,
    changed: parsed.markup !== parseSvg(markup).markup,
    affectedIds: [...affectedIds],
    nextSelectedId,
    nextSelectedIds,
    summary: envelope.summary,
    actions,
  }
}
