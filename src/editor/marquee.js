// Compare rendered bounds in viewport coordinates, including SVG and CSS transforms.
export function getMarqueeIds(host, box) {
  const nodes = Array.from(host?.querySelectorAll('[data-editor-id]') || []).filter((node) => {
    const style = getComputedStyle(node)
    if (style.visibility === 'hidden' || style.visibility === 'collapse' || !node.getClientRects().length) return false
    for (let parent = node; parent && parent !== host; parent = parent.parentElement) {
      if (getComputedStyle(parent).display === 'none') return false
    }
    const rect = node.getBoundingClientRect()
    return (rect.width > 0 || rect.height > 0) && rect.left >= box.left && rect.right <= box.right && rect.top >= box.top && rect.bottom <= box.bottom
  })
  const candidates = new Set(nodes)
  return nodes.filter((node) => {
    for (let parent = node.parentElement; parent && parent !== host; parent = parent.parentElement) {
      if (candidates.has(parent)) return false
    }
    return true
  }).map((node) => node.getAttribute('data-editor-id'))
}
