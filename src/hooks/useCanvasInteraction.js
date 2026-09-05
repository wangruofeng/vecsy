import { getLayerDistanceGuides } from '../editor/layer-distances.js'
import { getMarqueeIds } from '../editor/marquee.js'
import { useEffect, useRef, useState } from 'react'
import { clampScale, getElementPointerDelta, getNodeRect, getSvgPoint, getTopLevelSelectedIds, pointerCenter, pointerDistance, shouldCommitGesture } from '../editor/svg-geometry.js'
import { bakeRectTranslateScaleTransform, getEditableTextContent, resizeBackgroundLayer } from '../editor/svg-transforms.js'
import { editSvgDocument } from '../editor/edit-svg-document.js'

function getProportionalScale(scaleX, scaleY) {
  return Math.abs(scaleX - 1) >= Math.abs(scaleY - 1) ? scaleX : scaleY
}

export default function useCanvasInteraction({ activeTab, selectedId, selectedIds, selected, elements, svgMarkup, currentSnapshot, commitDocument, selectLayerIds }) {
  const [canvasTool, setCanvasTool] = useState('select')
  const [marqueeBox, setMarqueeBox] = useState(null)
  const marqueeRef = useRef(null)
  const temporaryCanvasToolRef = useRef(null)
  useEffect(() => {
    const cancel = (event) => {
      if (event.key !== 'Escape' || !marqueeRef.current) return
      event.preventDefault()
      event.stopImmediatePropagation()
      marqueeRef.current = null
      setMarqueeBox(null)
      suppressCanvasClickRef.current = true
    }
    window.addEventListener('keydown', cancel, true)
    return () => window.removeEventListener('keydown', cancel, true)
  }, [])
  useEffect(() => {
    const isTextInput = (target) => target?.closest?.('input, textarea, select, [contenteditable="true"]')
    const restoreTemporaryTool = () => {
      if (temporaryCanvasToolRef.current == null) return
      setCanvasTool(temporaryCanvasToolRef.current)
      temporaryCanvasToolRef.current = null
    }
    const handleShortcutKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTextInput(event.target)) return
      const key = event.key.toLowerCase()
      if (key === 'v') {
        event.preventDefault()
        setCanvasTool('select')
        return
      }
      if (key === 'h') {
        event.preventDefault()
        setCanvasTool('pan')
        return
      }
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault()
        temporaryCanvasToolRef.current = canvasTool
        setCanvasTool('pan')
      }
    }
    const handleShortcutKeyUp = (event) => {
      if (event.code !== 'Space' || temporaryCanvasToolRef.current == null) return
      event.preventDefault()
      restoreTemporaryTool()
    }
    window.addEventListener('keydown', handleShortcutKeyDown)
    window.addEventListener('keyup', handleShortcutKeyUp)
    window.addEventListener('blur', restoreTemporaryTool)
    return () => {
      window.removeEventListener('keydown', handleShortcutKeyDown)
      window.removeEventListener('keyup', handleShortcutKeyUp)
      window.removeEventListener('blur', restoreTemporaryTool)
    }
  }, [canvasTool])
  const [svgPosition, setSvgPosition] = useState({ x: 0, y: 0 })
  const [svgScale, setSvgScale] = useState(1)
  const [isDraggingSvg, setIsDraggingSvg] = useState(false)
  const [isDraggingElement, setIsDraggingElement] = useState(false)
  const [isResizingElement, setIsResizingElement] = useState(false)
  const [isPinchingSvg, setIsPinchingSvg] = useState(false)
  const [selectionBox, setSelectionBox] = useState(null)
  const [multiSelectionBoxes, setMultiSelectionBoxes] = useState([])
  const [lineEndpoints, setLineEndpoints] = useState(null)
  const [canvasLayoutVersion, setCanvasLayoutVersion] = useState(0)
  const [hoveredLayerId, setHoveredLayerId] = useState('')
  const [hoverBox, setHoverBox] = useState(null)
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [distanceGuides, setDistanceGuides] = useState([])
  useEffect(() => {
    const onKey = (event) => setIsMeasuring(event.altKey)
    const clear = () => setIsMeasuring(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
      window.removeEventListener('blur', clear)
    }
  }, [])
  const [transientMarkup, setTransientMarkup] = useState('')
  const canvasRef = useRef(null)
  const svgRef = useRef(null)
  const svgDragRef = useRef(null)
  const elementDragRef = useRef(null)
  const resizeRef = useRef(null)
  const activePointersRef = useRef(new Map())
  const pinchRef = useRef(null)
  const transientMarkupRef = useRef('')
  const previewFrameRef = useRef(0)
  const suppressCanvasClickRef = useRef(false)
  const lastTextTapRef = useRef({ id: '', time: 0 })

  useEffect(() => {
    const stage = canvasRef.current
    if (!stage || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => setCanvasLayoutVersion((version) => version + 1))
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const updateTransientMarkup = (markup) => {
    transientMarkupRef.current = markup
    if (previewFrameRef.current) return
    previewFrameRef.current = requestAnimationFrame(() => {
      previewFrameRef.current = 0
      setTransientMarkup(transientMarkupRef.current)
    })
  }

  const clearTransientMarkup = () => {
    if (previewFrameRef.current) cancelAnimationFrame(previewFrameRef.current)
    previewFrameRef.current = 0
    transientMarkupRef.current = ''
    setTransientMarkup('')
  }

  useEffect(() => {
    if (activeTab !== 'preview' || !selectedId) {
      setSelectionBox(null)
      setMultiSelectionBoxes([])
      setLineEndpoints(null)
      return undefined
    }
    const frame = requestAnimationFrame(() => {
      const stage = canvasRef.current
      const wrap = svgRef.current
      if (!stage || !wrap) {
        setSelectionBox(null)
        setMultiSelectionBoxes([])
        setLineEndpoints(null)
        return
      }
      const stageRect = stage.getBoundingClientRect()
      const getLineEndpoints = (node) => {
        const svg = wrap.querySelector('svg')
        const matrix = node?.getScreenCTM?.()
        if (!svg?.createSVGPoint || !matrix) return null
        const toStagePoint = (x, y) => {
          const point = svg.createSVGPoint()
          point.x = Number(node.getAttribute(x)) || 0
          point.y = Number(node.getAttribute(y)) || 0
          const screenPoint = point.matrixTransform(matrix)
          return { left: screenPoint.x - stageRect.left, top: screenPoint.y - stageRect.top }
        }
        const start = toStagePoint('x1', 'y1')
        const end = toStagePoint('x2', 'y2')
        const dx = end.left - start.left
        const dy = end.top - start.top
        return { start, end, length: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) * 180 / Math.PI }
      }
      const toBox = (id) => {
        const node = wrap.querySelector(`[data-editor-id="${id}"]`)
        if (node?.tagName === 'line') {
          const endpoints = getLineEndpoints(node)
          if (!endpoints) return null
          const padding = 8
          const left = Math.min(endpoints.start.left, endpoints.end.left) - padding
          const top = Math.min(endpoints.start.top, endpoints.end.top) - padding
          return { id, left, top, width: Math.max(1, Math.abs(endpoints.end.left - endpoints.start.left)) + padding * 2, height: Math.max(1, Math.abs(endpoints.end.top - endpoints.start.top)) + padding * 2 }
        }
        const rect = node ? getNodeRect(node) : null
        return rect ? { id, left: rect.left - stageRect.left, top: rect.top - stageRect.top, width: rect.width, height: rect.height } : null
      }
      setSelectionBox(toBox(selectedId))
      setMultiSelectionBoxes(selectedIds.filter((id) => id !== selectedId).map(toBox).filter(Boolean))
      const selectedNode = wrap.querySelector(`[data-editor-id="${selectedId}"]`)
      setLineEndpoints(selectedNode?.tagName === 'line' ? getLineEndpoints(selectedNode) : null)
    })
    return () => cancelAnimationFrame(frame)
  }, [activeTab, selectedId, selectedIds, svgMarkup, transientMarkup, svgPosition.x, svgPosition.y, svgScale, canvasLayoutVersion])

  useEffect(() => {
    if (activeTab !== 'preview' || canvasTool !== 'select' || !hoveredLayerId || selectedIds.includes(hoveredLayerId) || isDraggingSvg || isDraggingElement || isResizingElement || isPinchingSvg || marqueeBox) {
      setHoverBox(null)
      return undefined
    }
    const frame = requestAnimationFrame(() => {
      const stage = canvasRef.current
      const node = svgRef.current?.querySelector(`[data-editor-id="${hoveredLayerId}"]`)
      const rect = node ? getNodeRect(node) : null
      if (!stage || !rect) {
        setHoverBox(null)
        return
      }
      const stageRect = stage.getBoundingClientRect()
      setHoverBox({ id: hoveredLayerId, left: rect.left - stageRect.left, top: rect.top - stageRect.top, width: Math.max(1, rect.width), height: Math.max(1, rect.height) })
    })
    return () => cancelAnimationFrame(frame)
  }, [activeTab, canvasTool, hoveredLayerId, selectedIds, svgMarkup, svgPosition.x, svgPosition.y, svgScale, canvasLayoutVersion, isDraggingSvg, isDraggingElement, isResizingElement, isPinchingSvg, marqueeBox])

  useEffect(() => {
    if (!isMeasuring || !hoverBox || activeTab !== 'preview' || canvasTool !== 'select' || isDraggingSvg || isDraggingElement || isResizingElement || isPinchingSvg || marqueeBox) {
      setDistanceGuides([])
      return
    }
    const stage = canvasRef.current?.getBoundingClientRect()
    const wrap = svgRef.current
    const bounds = selectedIds.map((id) => getNodeRect(wrap?.querySelector(`[data-editor-id="${id}"]`))).filter(Boolean)
    const target = getNodeRect(wrap?.querySelector(`[data-editor-id="${hoverBox.id}"]`))
    if (!stage || !bounds.length || !target || selectedIds.includes(hoverBox.id)) {
      setDistanceGuides([])
      return
    }
    const selection = {
      left: Math.min(...bounds.map((box) => box.left)), right: Math.max(...bounds.map((box) => box.right)),
      top: Math.min(...bounds.map((box) => box.top)), bottom: Math.max(...bounds.map((box) => box.bottom)),
    }
    setDistanceGuides(getLayerDistanceGuides(selection, target).map(({ x1, y1, x2, y2 }) => {
      const from = getSvgPoint(wrap, x1, y1)
      const to = getSvgPoint(wrap, x2, y2)
      return { x1: x1 - stage.left, y1: y1 - stage.top, x2: x2 - stage.left, y2: y2 - stage.top, distance: Math.hypot(to.x - from.x, to.y - from.y) }
    }))
  }, [isMeasuring, hoverBox, selectedIds, activeTab, canvasTool, svgMarkup, svgScale, svgPosition.x, svgPosition.y, canvasLayoutVersion, isDraggingSvg, isDraggingElement, isResizingElement, isPinchingSvg, marqueeBox])

  const zoomBy = (factor) => setSvgScale((current) => clampScale(current * factor))

  const fitToScreen = () => {
    const stage = canvasRef.current
    const svg = svgRef.current?.querySelector('svg')
    if (!stage || !svg) return
    const rect = svg.getBoundingClientRect()
    const naturalWidth = rect.width / svgScale
    const naturalHeight = rect.height / svgScale
    if (!naturalWidth || !naturalHeight) return
    const nextScale = clampScale(Math.min((stage.clientWidth - 48) / naturalWidth, (stage.clientHeight - 48) / naturalHeight))
    setSvgScale(nextScale)
    setSvgPosition({ x: 0, y: 0 })
  }

  const getElementSvgBounds = (id) => {
    const node = svgRef.current?.querySelector(`[data-editor-id="${id}"]`)
    if (!node) return null
    const rect = node.getBoundingClientRect()
    if (!rect.width && !rect.height) return null
    const topLeft = getSvgPoint(svgRef.current, rect.left, rect.top)
    const bottomRight = getSvgPoint(svgRef.current, rect.right, rect.bottom)
    const minX = Math.min(topLeft.x, bottomRight.x)
    const minY = Math.min(topLeft.y, bottomRight.y)
    const maxX = Math.max(topLeft.x, bottomRight.x)
    const maxY = Math.max(topLeft.y, bottomRight.y)
    return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 }
  }

  const getEditableTarget = (target) => target?.closest?.('[data-editor-collection-icon]') || target?.closest?.('[data-editor-id]')

  const getEventElementTarget = (event) => getEditableTarget(event.target) || getEditableTarget(document.elementFromPoint(event.clientX, event.clientY))

  const selectElementAtPoint = (clientX, clientY, fallbackTarget, additive = false) => {
    const pointTarget = document.elementFromPoint(clientX, clientY)
    const target = getEditableTarget(pointTarget) || getEditableTarget(fallbackTarget)
    const targetId = target?.getAttribute('data-editor-id')
    if (!targetId) return ''
    if (additive) {
      const nextIds = selectedIds.includes(targetId) ? selectedIds.filter((id) => id !== targetId) : [...selectedIds, targetId]
      selectLayerIds(nextIds, targetId)
    } else if (!selectedIds.includes(targetId)) {
      selectLayerIds([targetId], targetId)
    }
    return targetId
  }

  const handleCanvasClick = (event) => {
    if (suppressCanvasClickRef.current) {
      suppressCanvasClickRef.current = false
      return
    }
    if (canvasTool === 'pan') return
    const elementTarget = getEventElementTarget(event)
    if (elementTarget) return
    const targetId = selectElementAtPoint(event.clientX, event.clientY, event.target, event.metaKey || event.ctrlKey || event.shiftKey)
    if (!targetId && !event.metaKey && !event.ctrlKey && !event.shiftKey) selectLayerIds([])
  }

  function startTextEdit(target, item, setTextDraft, setEditingTextId) {
    selectLayerIds([item.id], item.id)
    const stageRect = canvasRef.current?.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    if (stageRect && targetRect) setSelectionBox({ left: targetRect.left - stageRect.left, top: targetRect.top - stageRect.top, width: targetRect.width, height: targetRect.height })
    setTextDraft(getEditableTextContent(target))
    setEditingTextId(item.id)
  }

  const handleSvgDoubleClick = (event, setTextDraft, setEditingTextId) => {
    if (canvasTool === 'pan') return
    const eventTarget = getEventElementTarget(event)
    const eventItem = eventTarget ? elements.find((element) => element.id === eventTarget.getAttribute('data-editor-id')) : null
    // After the first click, the selection overlay can become the event target.
    // Fall back to the active text node so a normal double-click still edits it.
    const item = eventItem || (selected?.tag === 'text' ? selected : null)
    const target = eventTarget || (item ? svgRef.current?.querySelector(`[data-editor-id="${item.id}"]`) : null)
    if (!item || item.tag !== 'text') return
    event.preventDefault()
    event.stopPropagation()
    startTextEdit(target, item, setTextDraft, setEditingTextId)
  }

  const handleCanvasPointerDown = (event, setTextDraft, setEditingTextId) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const elementTarget = getEventElementTarget(event)
    const item = elementTarget ? elements.find((element) => element.id === elementTarget.getAttribute('data-editor-id')) : null
    if (item?.tag !== 'text') event.preventDefault()
    event.stopPropagation()
    const additive = event.metaKey || event.ctrlKey || event.shiftKey
    const stageRect = canvasRef.current?.getBoundingClientRect()
    const boxes = [selectionBox, ...multiSelectionBoxes].filter(Boolean)
    const x = event.clientX - (stageRect?.left || 0)
    const y = event.clientY - (stageRect?.top || 0)
    // Groups and multi-selections own their whole bounding box, including gaps above background layers.
    const hasSelectionArea = selectedIds.length > 1 ? boxes.length > 1 : selected?.tag === 'g' && boxes.length === 1
    const dragSelection = canvasTool === 'select' && !additive && hasSelectionArea &&
      x >= Math.min(...boxes.map((box) => box.left)) && x <= Math.max(...boxes.map((box) => box.left + box.width)) &&
      y >= Math.min(...boxes.map((box) => box.top)) && y <= Math.max(...boxes.map((box) => box.top + box.height))
    if (dragSelection) suppressCanvasClickRef.current = true
    const targetId = canvasTool === 'pan' ? '' : dragSelection ? selectedId : selectElementAtPoint(event.clientX, event.clientY, event.target, additive)
    activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    event.currentTarget.setPointerCapture(event.pointerId)

    if (activePointersRef.current.size === 2) {
      marqueeRef.current = null
      setMarqueeBox(null)
      const [first, second] = [...activePointersRef.current.values()]
      pinchRef.current = { distance: pointerDistance(first, second), scale: svgScale, center: pointerCenter(first, second), origin: svgPosition }
      svgDragRef.current = null
      elementDragRef.current = null
      setIsDraggingSvg(false)
      setIsDraggingElement(false)
      setIsPinchingSvg(true)
      return
    }

    if (canvasTool === 'pan') {
      suppressCanvasClickRef.current = true
      svgDragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: svgPosition, moved: false }
      elementDragRef.current = null
      setIsDraggingSvg(true)
      return
    }
    if (!elementTarget && !dragSelection && event.pointerType !== 'touch') {
      marqueeRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, baseIds: event.shiftKey ? selectedIds : [], ids: [], moved: false }
      return
    }
    if (elementTarget && (event.shiftKey || event.metaKey || event.ctrlKey)) {
      suppressCanvasClickRef.current = true
      return
    }
    if (elementTarget || dragSelection) {
      const selectionIds = targetId && selectedIds.includes(targetId) && !event.metaKey && !event.ctrlKey ? selectedIds : [targetId]
      elementDragRef.current = {
        pointerId: event.pointerId,
        targetIds: getTopLevelSelectedIds(svgMarkup, selectionIds),
        selectionIds,
        startX: event.clientX,
        startY: event.clientY,
        baseMarkup: svgMarkup,
        baseSnapshot: currentSnapshot(),
        previewMarkup: svgMarkup,
        moved: false,
      }
      svgDragRef.current = null
      setIsDraggingSvg(false)
      setIsDraggingElement(false)
      return
    }

    svgDragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: svgPosition, moved: false }
    elementDragRef.current = null
    setIsDraggingElement(false)
    setIsDraggingSvg(true)
  }

  const handleCanvasPointerMove = (event) => {
    const hoveredId = getEventElementTarget(event)?.getAttribute('data-editor-id') || ''
    setHoveredLayerId((current) => current === hoveredId ? current : hoveredId)
    if (activePointersRef.current.has(event.pointerId)) activePointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (activePointersRef.current.size >= 2) {
      const [first, second] = [...activePointersRef.current.values()]
      const pinch = pinchRef.current
      if (pinch) {
        const center = pointerCenter(first, second)
        if (pinch.distance > 0) setSvgScale(clampScale(pinch.scale * pointerDistance(first, second) / pinch.distance))
        setSvgPosition({ x: pinch.origin.x + center.x - pinch.center.x, y: pinch.origin.y + center.y - pinch.center.y })
      }
      return
    }

    const marquee = marqueeRef.current
    if (marquee && marquee.pointerId === event.pointerId) {
      if (Math.hypot(event.clientX - marquee.x, event.clientY - marquee.y) <= 4 && !marquee.moved) return
      marquee.moved = true
      const box = { left: Math.min(marquee.x, event.clientX), top: Math.min(marquee.y, event.clientY), right: Math.max(marquee.x, event.clientX), bottom: Math.max(marquee.y, event.clientY) }
      marquee.ids = getMarqueeIds(svgRef.current, box)
      const stage = canvasRef.current.getBoundingClientRect()
      setMarqueeBox({ left: box.left - stage.left, top: box.top - stage.top, width: box.right - box.left, height: box.bottom - box.top })
      return
    }
    const elementDrag = elementDragRef.current
    if (elementDrag && elementDrag.pointerId === event.pointerId) {
      const screenDistance = Math.hypot(event.clientX - elementDrag.startX, event.clientY - elementDrag.startY)
      if (screenDistance <= 2) return
      const start = { x: elementDrag.startX, y: elementDrag.startY }
      const current = { x: event.clientX, y: event.clientY }
      const moves = elementDrag.targetIds.map((id) => {
        const node = svgRef.current?.querySelector(`[data-editor-id="${id}"]`)
        const delta = getElementPointerDelta(svgRef.current, node, start, current)
        return { id, dx: delta.x, dy: delta.y }
      })
      const transaction = editSvgDocument(elementDrag.baseMarkup, { type: 'translate-by-id', moves, selectedId: elementDrag.selectionIds[0], selectedIds: elementDrag.selectionIds })
      elementDrag.previewMarkup = transaction.markup
      elementDrag.moved = true
      updateTransientMarkup(transaction.markup)
      setIsDraggingElement(true)
      return
    }

    const drag = svgDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) <= 3) return
    drag.moved = true
    setSvgPosition({ x: drag.origin.x + event.clientX - drag.startX, y: drag.origin.y + event.clientY - drag.startY })
  }

  const handleCanvasPointerUp = (event, cancelled = false, setTextDraft, setEditingTextId) => {
    const marquee = marqueeRef.current
    if (marquee && marquee.pointerId === event.pointerId) {
      if (!cancelled && marquee.moved) selectLayerIds([...marquee.baseIds, ...marquee.ids])
      if (marquee.moved || cancelled) suppressCanvasClickRef.current = true
      marqueeRef.current = null
      setMarqueeBox(null)
    }
    activePointersRef.current.delete(event.pointerId)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (activePointersRef.current.size < 2) {
      pinchRef.current = null
      setIsPinchingSvg(false)
    }
    if (activePointersRef.current.size > 0) return

    const elementDrag = elementDragRef.current
    if (elementDrag && elementDrag.pointerId === event.pointerId) {
      if (elementDrag.moved) suppressCanvasClickRef.current = true
      const textItem = !cancelled && !elementDrag.moved && elementDrag.selectionIds.length === 1 ? elements.find((item) => item.id === elementDrag.selectionIds[0] && item.tag === 'text') : null
      if (textItem) {
        const now = performance.now()
        const isSecondTap = lastTextTapRef.current.id === textItem.id && now - lastTextTapRef.current.time < 500
        lastTextTapRef.current = isSecondTap ? { id: '', time: 0 } : { id: textItem.id, time: now }
        if (isSecondTap) {
          const target = svgRef.current?.querySelector(`[data-editor-id="${textItem.id}"]`)
          if (target) startTextEdit(target, textItem, setTextDraft, setEditingTextId)
        }
      }
      if (!shouldCommitGesture({ cancelled, moved: elementDrag.moved })) clearTransientMarkup()
      else {
        clearTransientMarkup()
        commitDocument(elementDrag.previewMarkup, { nextSelectedId: elementDrag.selectionIds[0], nextSelectedIds: elementDrag.selectionIds, historySnapshot: elementDrag.baseSnapshot, forceHistory: true })
      }
      elementDragRef.current = null
      setIsDraggingElement(false)
    }
    if (svgDragRef.current?.moved) suppressCanvasClickRef.current = true
    svgDragRef.current = null
    setIsDraggingSvg(false)
  }

  const handleResizePointerDown = (event, handle) => {
    if (!selectionBox || !selected || resizeRef.current) return
    event.preventDefault()
    event.stopPropagation()
    const target = svgRef.current?.querySelector(`[data-editor-id="${selected.id}"]`)
    const baseBox = getNodeRect(target)
    if (!target || (selected.tag !== 'line' && (!baseBox?.width || !baseBox?.height))) return
    const backgroundRect = selected.tag === 'g' && target.parentElement?.tagName === 'svg' ? Array.from(target.children).find((node) => node.tagName === 'rect' && node.hasAttribute('fill')) : null
    let ancestor = target.parentElement
    let hasTransformedAncestor = false
    while (selected.tag === 'rect' && ancestor?.tagName !== 'svg') {
      if (ancestor.hasAttribute('transform')) hasTransformedAncestor = true
      ancestor = ancestor.parentElement
    }
    const bakedRect = selected.tag === 'rect' && !hasTransformedAncestor ? bakeRectTranslateScaleTransform(svgMarkup, selected.id) : null
    const pointerId = event.pointerId ?? 'mouse'
    if (event.pointerId != null && event.currentTarget.setPointerCapture) event.currentTarget.setPointerCapture(event.pointerId)
    resizeRef.current = {
      pointerId, targetId: selected.id, handle, kind: selected.tag === 'line' ? 'line' : backgroundRect ? 'background' : bakedRect ? 'rect' : 'shape',
      lineEndpoint: selected.tag === 'line' ? (handle === 'line-start' ? 'x1' : 'x2') : '',
      rect: bakedRect?.rect || null,
      background: backgroundRect ? {
        topLeft: getSvgPoint(svgRef.current, baseBox.left, baseBox.top),
        bottomRight: getSvgPoint(svgRef.current, baseBox.right, baseBox.bottom),
        minWidth: Math.abs(getSvgPoint(svgRef.current, baseBox.left + 8, baseBox.top).x - getSvgPoint(svgRef.current, baseBox.left, baseBox.top).x),
        minHeight: Math.abs(getSvgPoint(svgRef.current, baseBox.left, baseBox.top + 8).y - getSvgPoint(svgRef.current, baseBox.left, baseBox.top).y),
      } : null,
      baseBox, baseMarkup: bakedRect?.markup || svgMarkup, baseSnapshot: currentSnapshot(), baseTransform: target.getAttribute('transform') || '', previewMarkup: bakedRect?.markup || svgMarkup, moved: false,
    }
    window.addEventListener('pointermove', handleResizePointerMove)
    window.addEventListener('pointerup', handleResizePointerUp)
    window.addEventListener('mousemove', handleResizePointerMove)
    window.addEventListener('mouseup', handleResizePointerUp)
    setIsResizingElement(true)
  }

  const handleResizePointerMove = (event) => {
    const resize = resizeRef.current
    if (!resize || (event.pointerId != null && resize.pointerId !== event.pointerId) || (event.type.startsWith('mouse') && resize.pointerId !== 'mouse')) return
    event.preventDefault()
    if (resize.kind === 'line') {
      const point = getSvgPoint(svgRef.current, event.clientX, event.clientY)
      const endpointUpdates = resize.lineEndpoint === 'x1' ? { x1: point.x.toFixed(2), y1: point.y.toFixed(2) } : { x2: point.x.toFixed(2), y2: point.y.toFixed(2) }
      const transaction = editSvgDocument(resize.baseMarkup, { type: 'set-attributes', targetId: resize.targetId, updates: endpointUpdates })
      resize.previewMarkup = transaction.markup
      resize.moved = true
      updateTransientMarkup(transaction.markup)
      return
    }
    const isLeftHandle = resize.handle.endsWith('left')
    const isTopHandle = resize.handle.startsWith('top')
    if (resize.kind === 'background') {
      const pointer = getSvgPoint(svgRef.current, event.clientX, event.clientY)
      const { topLeft, bottomRight, minWidth, minHeight } = resize.background
      const baseWidth = bottomRight.x - topLeft.x
      const baseHeight = bottomRight.y - topLeft.y
      let width = isLeftHandle ? bottomRight.x - Math.min(pointer.x, bottomRight.x - minWidth) : Math.max(pointer.x, topLeft.x + minWidth) - topLeft.x
      let height = isTopHandle ? bottomRight.y - Math.min(pointer.y, bottomRight.y - minHeight) : Math.max(pointer.y, topLeft.y + minHeight) - topLeft.y
      if (event.shiftKey && baseWidth && baseHeight) {
        const scale = getProportionalScale(width / baseWidth, height / baseHeight)
        width = Math.max(minWidth, baseWidth * scale)
        height = Math.max(minHeight, baseHeight * scale)
      }
      const minX = isLeftHandle ? bottomRight.x - width : topLeft.x
      const minY = isTopHandle ? bottomRight.y - height : topLeft.y
      const maxX = minX + width
      const maxY = minY + height
      const nextMarkup = resizeBackgroundLayer(resize.baseMarkup, resize.targetId, { minX, minY, width: maxX - minX, height: maxY - minY })
      resize.previewMarkup = nextMarkup
      resize.moved = true
      updateTransientMarkup(nextMarkup)
      return
    }
    const { baseBox } = resize
    const minSize = 8
    const anchor = { x: isLeftHandle ? baseBox.right : baseBox.left, y: isTopHandle ? baseBox.bottom : baseBox.top }
    const width = isLeftHandle ? anchor.x - Math.min(event.clientX, anchor.x - minSize) : Math.max(event.clientX, anchor.x + minSize) - anchor.x
    const height = isTopHandle ? anchor.y - Math.min(event.clientY, anchor.y - minSize) : Math.max(event.clientY, anchor.y + minSize) - anchor.y
    let scaleX = width / baseBox.width
    let scaleY = height / baseBox.height
    if (event.shiftKey) {
      const scale = getProportionalScale(scaleX, scaleY)
      scaleX = scale
      scaleY = scale
    }
    if (resize.kind === 'rect' && resize.rect.width && resize.rect.height) {
      const nextWidth = resize.rect.width * scaleX
      const nextHeight = resize.rect.height * scaleY
      const nextX = isLeftHandle ? resize.rect.x + resize.rect.width - nextWidth : resize.rect.x
      const nextY = isTopHandle ? resize.rect.y + resize.rect.height - nextHeight : resize.rect.y
      const transaction = editSvgDocument(resize.baseMarkup, { type: 'set-attributes', targetId: resize.targetId, updates: {
        x: nextX.toFixed(2), y: nextY.toFixed(2), width: nextWidth.toFixed(2), height: nextHeight.toFixed(2),
      } })
      resize.previewMarkup = transaction.markup
      resize.moved = true
      updateTransientMarkup(transaction.markup)
      return
    }
    const anchorPoint = getSvgPoint(svgRef.current, anchor.x, anchor.y)
    const resizeTransform = `translate(${anchorPoint.x.toFixed(2)} ${anchorPoint.y.toFixed(2)}) scale(${scaleX.toFixed(4)} ${scaleY.toFixed(4)}) translate(${-anchorPoint.x.toFixed(2)} ${-anchorPoint.y.toFixed(2)})`
    const nextTransform = resize.baseTransform ? `${resizeTransform} ${resize.baseTransform}` : resizeTransform
    const transaction = editSvgDocument(resize.baseMarkup, { type: 'set-transform', targetId: resize.targetId, transform: nextTransform })
    resize.previewMarkup = transaction.markup
    resize.moved = true
    updateTransientMarkup(transaction.markup)
  }

  const handleResizePointerUp = (event, cancelled = false) => {
    const resize = resizeRef.current
    if (!resize || (event.pointerId != null && resize.pointerId !== event.pointerId)) return
    if (event.pointerId != null && event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    window.removeEventListener('pointermove', handleResizePointerMove)
    window.removeEventListener('pointerup', handleResizePointerUp)
    window.removeEventListener('mousemove', handleResizePointerMove)
    window.removeEventListener('mouseup', handleResizePointerUp)
    suppressCanvasClickRef.current = true
    if (!shouldCommitGesture({ cancelled, moved: resize.moved })) clearTransientMarkup()
    else {
      clearTransientMarkup()
      commitDocument(resize.previewMarkup, { nextSelectedId: resize.targetId, historySnapshot: resize.baseSnapshot, forceHistory: true })
    }
    resizeRef.current = null
    setIsResizingElement(false)
  }

  useEffect(() => {
    const stage = canvasRef.current
    if (!stage || activeTab !== 'preview') return undefined
    const handleWheel = (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.ctrlKey || event.metaKey) {
        const factor = Math.exp(-event.deltaY * 0.0025)
        setSvgScale((current) => clampScale(current * factor))
        return
      }
      setSvgPosition((current) => ({ x: current.x - event.deltaX, y: current.y - event.deltaY }))
    }
    stage.addEventListener('wheel', handleWheel, { passive: false })
    return () => stage.removeEventListener('wheel', handleWheel)
  }, [activeTab])

  return {
    canvasTool, setCanvasTool, marqueeBox,
    canvasRef, svgRef, svgPosition, setSvgPosition, svgScale, setSvgScale,
    isDraggingSvg, isDraggingElement, isResizingElement, isPinchingSvg,
    selectionBox, setSelectionBox, multiSelectionBoxes, lineEndpoints, hoverBox, distanceGuides, hoveredLayerId, setHoveredLayerId,
    transientMarkup, updateTransientMarkup, clearTransientMarkup, zoomBy, fitToScreen, getElementSvgBounds,
    handleCanvasClick, handleSvgDoubleClick, handleCanvasPointerDown, handleCanvasPointerMove, handleCanvasPointerUp,
    handleResizePointerDown, handleResizePointerMove, handleResizePointerUp, suppressCanvasClickRef,
  }
}
