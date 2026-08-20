import { getSvgDimensions } from '../editor/svg-geometry.js'
import { getSvgColorTokens, parseSvg } from '../editor/svg-parser.js'

function attributesFor(node) {
  return Object.fromEntries(Array.from(node.attributes)
    .filter((attribute) => !attribute.name.startsWith('data-editor-'))
    .map((attribute) => [attribute.name, attribute.value]))
}

export function buildDesignContext(markup, selectedIds) {
  const parsed = parseSvg(markup)
  const doc = new DOMParser().parseFromString(parsed.markup, 'image/svg+xml')
  const selected = new Set(selectedIds)
  const selection = parsed.elements.filter((element) => selected.has(element.id)).map((element) => {
    const node = doc.querySelector(`[data-editor-id="${element.id}"]`)
    return {
      id: element.id,
      tag: element.tag,
      name: element.name,
      parentId: node?.parentElement?.getAttribute('data-editor-id') || null,
      attributes: node ? attributesFor(node) : {},
    }
  })
  const dimensions = getSvgDimensions(doc)
  return {
    document: { viewBox: doc.documentElement.getAttribute('viewBox') || '', width: dimensions.width, height: dimensions.height },
    selection,
    selectedIds: selection.map((item) => item.id),
    availableIds: parsed.elements.map((element) => element.id),
    styleTokens: { colors: getSvgColorTokens(parsed.markup).map((token) => token.color) },
  }
}
