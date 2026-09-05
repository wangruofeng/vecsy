import LayerDistances from './LayerDistances.jsx'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { highlightSelectedMarkup, highlightSvgSource } from '../editor/svg-transforms.js'
import { getElementAndDescendantIds } from '../editor/svg-parser.js'

function getSourceRows(source, elements, expandedGroups) {
  const lines = source.split('\n')
  const elementById = new Map(elements.map((item) => [item.id, item]))
  const stack = []
  const rows = []
  const tagPattern = /<\/?([A-Za-z_][\w:.-]*)\b[^>]*>/g

  lines.forEach((line, lineIndex) => {
    const idMatch = line.match(/data-editor-id=["']([^"']+)["']/)
    const item = idMatch ? elementById.get(idMatch[1]) : null
    const tags = [...line.matchAll(tagPattern)]
    const closingTag = line.trim().startsWith('</')
    if (closingTag) stack.pop()
    const hidden = stack.some((id) => expandedGroups[id] === false)
    if (!hidden) rows.push({ type: 'line', line, lineIndex, item })
    if (item?.tag === 'g' && !line.trim().endsWith('/>') && !closingTag) {
      stack.push(item.id)
      if (expandedGroups[item.id] === false) rows.push({ type: 'fold', lineIndex, item })
    } else if (tags.some((match) => !line.slice(match.index).startsWith('</')) && !line.trim().endsWith('/>') && !item) {
      stack.push('non-editable')
    }
    if (closingTag && stack[stack.length - 1] === 'non-editable') stack.pop()
  })
  return rows
}

function InlineTextEditor({ canvasRef, svgRef, editingTextId, textDraft, setTextDraft, commitTextEdit, cancelTextEdit, copy, svgScale, svgPosition, renderedMarkup }) {
  const [metrics, setMetrics] = useState(null)

  useLayoutEffect(() => {
    const stage = canvasRef.current
    if (!stage) return undefined
    let frame = 0
    const update = () => {
      frame = 0
      const source = svgRef.current?.querySelector(`[data-editor-id="${editingTextId}"]`)
      if (!source) return
      const stageRect = stage.getBoundingClientRect()
      const sourceRect = source.getBoundingClientRect()
      const computed = window.getComputedStyle(source)
      const fontSize = Number.parseFloat(computed.fontSize) || 16
      const svg = source.closest('svg')
      const viewBox = (svg?.getAttribute('viewBox') || '').trim().split(/[\s,]+/).map(Number)
      const svgRect = svg?.getBoundingClientRect()
      const scaleX = svgRect && viewBox[2] ? svgRect.width / viewBox[2] : 1
      const scaleY = svgRect && viewBox[3] ? svgRect.height / viewBox[3] : 1
      const toScreenPixels = (value, scale) => {
        const parsed = Number.parseFloat(value)
        return Number.isFinite(parsed) ? `${parsed * scale}px` : value
      }
      const screenFontSize = fontSize * scaleY
      const textAnchor = source.getAttribute('text-anchor') || 'start'
      setMetrics({
        left: sourceRect.left - stageRect.left - 1,
        top: sourceRect.top - stageRect.top - 1,
        width: Math.max(sourceRect.width + 2, 40),
        height: Math.max(sourceRect.height + 2, screenFontSize * 1.2),
        color: computed.fill,
        fontFamily: computed.fontFamily,
        fontSize: `${screenFontSize}px`,
        fontStyle: computed.fontStyle,
        fontWeight: computed.fontWeight,
        letterSpacing: toScreenPixels(computed.letterSpacing, scaleX),
        lineHeight: computed.lineHeight === 'normal' ? `${screenFontSize * 1.2}px` : toScreenPixels(computed.lineHeight, scaleY),
        textAlign: textAnchor === 'middle' ? 'center' : textAnchor === 'end' ? 'right' : 'left',
      })
    }
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    scheduleUpdate()
    const observer = new ResizeObserver(scheduleUpdate)
    observer.observe(stage)
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [canvasRef, svgRef, editingTextId, svgScale, svgPosition.x, svgPosition.y, renderedMarkup])

  if (!metrics) return null
  return <input
    type="text"
    className="text-inline-editor"
    style={metrics}
    value={textDraft}
    autoFocus
    onChange={(event) => setTextDraft(event.target.value)}
    onFocus={(event) => event.currentTarget.select()}
    onKeyDown={(event) => {
      event.stopPropagation()
      if (event.key === 'Enter') { event.preventDefault(); commitTextEdit(event.currentTarget.value) }
      if (event.key === 'Escape') { event.preventDefault(); cancelTextEdit() }
    }}
    onBlur={(event) => commitTextEdit(event.currentTarget.value)}
    onClick={(event) => event.stopPropagation()}
    onPointerDown={(event) => event.stopPropagation()}
    aria-label={copy.editText}
  />
}

export default function CanvasPanel(props) {
  const { canvasTool, setCanvasTool, marqueeBox, copy, activeTab, setActiveTab, formatSource, simplifySource, sourceDisplayMode, setSourceDisplayMode, expandedGroups, toggleGroup, selectedIds, selectLayerIds, alignSelection, zoomBy, fitToScreen, svgScale, setSvgScale, setSvgPosition, canvasRef, handleCanvasClick, handleSvgDoubleClick, openContextMenu, handleCanvasPointerDown, handleCanvasPointerMove, handleCanvasPointerUp, distanceGuides, hoverBox, hoveredLayerId, setHoveredLayerId, elements, isDraggingSvg, isDraggingElement, isPinchingSvg, svgRef, svgPosition, renderedMarkup, editingTextId, selectedId, selected, selectionBox, lineEndpoints, textDraft, setTextDraft, commitTextEdit, cancelTextEdit, language, selectionGroupBox, multiSelectionBoxes, isResizingElement, handleResizePointerMove, handleResizePointerUp, handleResizePointerDown, sourceHighlightRef, highlightedSource, sourceDraft, setSourceDraft, syncSourceScroll, commitSourceMarkup, showToast, loadDemo, toast, toastTimerRef, selectedDisplayName, setToast } = props
  const previewHtml = useMemo(() => ({ __html: highlightSelectedMarkup(renderedMarkup, editingTextId) }), [renderedMarkup, editingTextId])
  const [hasAnimation, setHasAnimation] = useState(false)
  const [isAnimationPaused, setIsAnimationPaused] = useState(false)
  const sourceRowRefs = useRef(new Map())
  const sourceRows = getSourceRows(sourceDraft, elements, expandedGroups)
  const selectSourceItem = (item) => selectLayerIds(getElementAndDescendantIds(elements, item.id), item.id)

  // 源码树形模式下，选中图层时自动滚动到对应源码行（仿照 main.jsx 的图层列表滚动逻辑）。
  // 依赖 sourceRows 而非 sourceRows.length：选中折叠组内元素时，自动展开 effect 先运行，
  // 下一次渲染 sourceRows 才会包含该行，因此需要这里再次触发滚动。
  useEffect(() => {
    if (activeTab !== 'source' || sourceDisplayMode !== 'tree' || !selectedId) return
    const row = sourceRowRefs.current.get(selectedId)
    if (!row) return
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    row.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [selectedId, sourceRows, activeTab, sourceDisplayMode])

  const setAnimationPlayback = (paused) => {
    const svg = svgRef.current?.querySelector('svg')
    if (!svg) return
    const animations = svg.getAnimations?.({ subtree: true }) || []
    if (paused) {
      svg.pauseAnimations?.()
      animations.forEach((animation) => animation.pause())
    } else {
      svg.unpauseAnimations?.()
      animations.forEach((animation) => animation.play())
    }
  }

  useEffect(() => {
    const svg = svgRef.current?.querySelector('svg')
    const hasSmilAnimation = Boolean(svg?.querySelector('animate, animateMotion, animateTransform, set'))
    const hasCssAnimation = Boolean(svg?.getAnimations?.({ subtree: true }).length)
    setHasAnimation(hasSmilAnimation || hasCssAnimation)
    if (isAnimationPaused) setAnimationPlayback(true)
  }, [activeTab, isAnimationPaused, renderedMarkup, svgRef])

  const toggleAnimationPlayback = () => {
    const nextPaused = !isAnimationPaused
    setAnimationPlayback(nextPaused)
    setIsAnimationPaused(nextPaused)
  }

  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(sourceDraft)
      showToast(copy.toastSourceCopied)
    } catch {
      showToast(copy.toastSourceCopyFailed, 'error')
    }
  }

  return (
        <section className="canvas-panel">
          <div className="canvas-toolbar">
            <div className="view-tabs"><button className={activeTab === 'preview' ? 'active' : ''} onClick={() => setActiveTab('preview')}><Icon name="eye" size={14} /> {copy.preview}</button><button className={activeTab === 'source' ? 'active' : ''} onClick={() => setActiveTab('source')}><Icon name="code" size={14} /> {copy.source}</button></div>
            <div className="canvas-tools">{activeTab === 'source' ? <><button className="tool-button" type="button" title={copy.format} onClick={formatSource}><Icon name="code" size={15} /> {copy.format}</button><button className="tool-button" type="button" title={copy.simplify} onClick={simplifySource} disabled={!sourceDraft}><Icon name="simplify" size={14} /> {copy.simplify}</button><button className="tool-button" type="button" title={copy.copySource} onClick={copySource} disabled={!sourceDraft}><Icon name="copy" size={14} /> {copy.copySource}</button>{sourceDisplayMode === 'tree' ? <button className="tool-button" type="button" onClick={() => setSourceDisplayMode('edit')}><Icon name="edit" size={14} /> {copy.editSource}</button> : null}</> : <><div className="view-tabs canvas-mode-tools">{[['select', copy.canvasSelect, 'V', 'cursor'], ['pan', copy.canvasPan, 'H', 'hand']].map(([tool, label, shortcut, icon]) => <button key={tool} className={canvasTool === tool ? 'active' : ''} type="button" title={`${label} (${shortcut})`} aria-keyshortcuts={shortcut} aria-pressed={canvasTool === tool} onClick={() => setCanvasTool(tool)}><Icon name={icon} size={14} /> {label}</button>)}</div>{selectedIds.length >= 2 && <span className="align-group"><button className="mini-button" type="button" title={copy.alignLeft} aria-label={copy.alignLeft} onClick={() => alignSelection('left')}><Icon name="alignLeft" size={14} /></button><button className="mini-button" type="button" title={copy.alignCenterX} aria-label={copy.alignCenterX} onClick={() => alignSelection('center-x')}><Icon name="alignCenterX" size={14} /></button><button className="mini-button" type="button" title={copy.alignRight} aria-label={copy.alignRight} onClick={() => alignSelection('right')}><Icon name="alignRight" size={14} /></button><button className="mini-button" type="button" title={copy.alignTop} aria-label={copy.alignTop} onClick={() => alignSelection('top')}><Icon name="alignTop" size={14} /></button><button className="mini-button" type="button" title={copy.alignCenterY} aria-label={copy.alignCenterY} onClick={() => alignSelection('center-y')}><Icon name="alignCenterY" size={14} /></button><button className="mini-button" type="button" title={copy.alignBottom} aria-label={copy.alignBottom} onClick={() => alignSelection('bottom')}><Icon name="alignBottom" size={14} /></button><button className="mini-button" type="button" title={copy.distributeX} aria-label={copy.distributeX} disabled={selectedIds.length < 3} onClick={() => alignSelection('distribute-x')}><Icon name="distributeX" size={14} /></button><button className="mini-button" type="button" title={copy.distributeY} aria-label={copy.distributeY} onClick={() => alignSelection('distribute-y')}><Icon name="distributeY" size={14} /></button></span>}{hasAnimation && <button className="icon-button" type="button" title={isAnimationPaused ? copy.playAnimation : copy.pauseAnimation} aria-label={isAnimationPaused ? copy.playAnimation : copy.pauseAnimation} aria-pressed={isAnimationPaused} onClick={toggleAnimationPlayback}><Icon name={isAnimationPaused ? 'play' : 'pause'} size={14} /></button>}<button className="icon-button" type="button" title={`${copy.zoomOut} (⌘-)`} aria-label={copy.zoomOut} onClick={() => zoomBy(0.8)}><Icon name="minus" size={14} /></button><button className="icon-button" type="button" title={`${copy.zoomIn} (⌘=)`} aria-label={copy.zoomIn} onClick={() => zoomBy(1.25)}><Icon name="plus" size={14} /></button><button className="icon-button" type="button" title={`${copy.zoomFit} (⌘0)`} aria-label={copy.zoomFit} onClick={fitToScreen}><Icon name="fit" size={14} /></button><button className="zoom-readout" type="button" title={copy.resetView} onClick={() => { setSvgScale(1); setSvgPosition({ x: 0, y: 0 }) }}>{Math.round(svgScale * 100)}%</button></>}</div>
          </div>
          {activeTab === 'preview' ? (
            <div ref={canvasRef} className={`canvas-stage ${canvasTool === 'pan' ? 'canvas-pan' : 'canvas-select'}`} onClick={handleCanvasClick} onDoubleClick={handleSvgDoubleClick} onContextMenu={(event) => { const target = event.target?.closest?.('[data-editor-id]'); if (target) openContextMenu(event, target.getAttribute('data-editor-id')) }} onPointerDown={handleCanvasPointerDown} onPointerMove={handleCanvasPointerMove} onPointerUp={handleCanvasPointerUp} onPointerCancel={(event) => handleCanvasPointerUp(event, true)} onPointerLeave={() => setHoveredLayerId('')}>
              {marqueeBox && <div className="canvas-marquee" style={marqueeBox} />}
              {elements.length === 0 && <div className="drop-hint"><span className="drop-icon"><Icon name="upload" size={15} /></span><span>{copy.dropHint}</span></div>}
              <div
                className={`svg-wrap ${isDraggingSvg || isDraggingElement ? 'is-dragging' : ''} ${isDraggingElement ? 'is-dragging-element' : ''} ${isPinchingSvg ? 'is-pinching' : ''}`}
                ref={svgRef}
                style={{ '--svg-x': `${svgPosition.x}px`, '--svg-y': `${svgPosition.y}px`, '--svg-scale': svgScale }}
                dangerouslySetInnerHTML={previewHtml}
              />
              {editingTextId === selectedId && selected?.tag === 'text' && <InlineTextEditor canvasRef={canvasRef} svgRef={svgRef} editingTextId={editingTextId} textDraft={textDraft} setTextDraft={setTextDraft} commitTextEdit={commitTextEdit} cancelTextEdit={cancelTextEdit} copy={copy} svgScale={svgScale} svgPosition={svgPosition} renderedMarkup={renderedMarkup} />}
              {!editingTextId && <LayerDistances guides={distanceGuides} />}
              {hoverBox && !editingTextId && <div className="layer-hover-overlay" aria-hidden="true" data-layer-id={hoverBox.id} style={{ left: hoverBox.left, top: hoverBox.top, width: hoverBox.width, height: hoverBox.height }} />}
              {selectionGroupBox && <div className="selection-overlay selection-overlay-group" style={{ left: selectionGroupBox.left, top: selectionGroupBox.top, width: selectionGroupBox.right - selectionGroupBox.left, height: selectionGroupBox.bottom - selectionGroupBox.top }} />}
              {selectedIds.length > 1 && selectionBox && <div className="selection-overlay selection-overlay-multi" style={{ left: selectionBox.left, top: selectionBox.top, width: selectionBox.width, height: selectionBox.height }} />}
              {selectedIds.length > 1 && multiSelectionBoxes.map((box) => <div key={box.id} className="selection-overlay selection-overlay-multi" style={{ left: box.left, top: box.top, width: box.width, height: box.height }} />)}
              {canvasTool !== 'pan' && selectedIds.length <= 1 && selectionBox && selected && !editingTextId && (selected.tag === 'line' && lineEndpoints ? <div className={`selection-overlay selection-overlay-line ${isResizingElement ? 'is-resizing' : ''} ${hoveredLayerId === selected.id ? 'is-hovered' : ''}`} style={{ left: 0, top: 0, width: '100%', height: '100%' }}><span className="line-selection-stroke" style={{ left: lineEndpoints.start.left, top: lineEndpoints.start.top, width: lineEndpoints.length, transform: `rotate(${lineEndpoints.angle}deg)` }} /><button className="resize-handle resize-handle-line-start" type="button" style={{ left: lineEndpoints.start.left, top: lineEndpoints.start.top }} aria-label={copy.resizeLineStart} title={copy.resizeLineStart} onPointerDown={(event) => handleResizePointerDown(event, 'line-start')} onMouseDown={(event) => handleResizePointerDown(event, 'line-start')} onPointerMove={handleResizePointerMove} onPointerUp={handleResizePointerUp} onPointerCancel={(event) => handleResizePointerUp(event, true)} /><button className="resize-handle resize-handle-line-end" type="button" style={{ left: lineEndpoints.end.left, top: lineEndpoints.end.top }} aria-label={copy.resizeLineEnd} title={copy.resizeLineEnd} onPointerDown={(event) => handleResizePointerDown(event, 'line-end')} onMouseDown={(event) => handleResizePointerDown(event, 'line-end')} onPointerMove={handleResizePointerMove} onPointerUp={handleResizePointerUp} onPointerCancel={(event) => handleResizePointerUp(event, true)} /><span className="line-selection-label" style={{ left: (lineEndpoints.start.left + lineEndpoints.end.left) / 2, top: (lineEndpoints.start.top + lineEndpoints.end.top) / 2 }}>{Math.round(lineEndpoints.length)} px · {Math.round(lineEndpoints.angle)}°</span></div> : <div className={`selection-overlay ${isResizingElement ? 'is-resizing' : ''} ${hoveredLayerId === selected.id ? 'is-hovered' : ''}`} style={{ left: selectionBox.left, top: selectionBox.top, width: selectionBox.width, height: selectionBox.height }} onPointerMove={handleResizePointerMove} onPointerUp={handleResizePointerUp} onPointerCancel={(event) => handleResizePointerUp(event, true)}><button className="resize-handle resize-handle-top-left" type="button" aria-label={copy.resizeTopLeft} title={copy.resizeTopLeft} onPointerDown={(event) => handleResizePointerDown(event, 'top-left')} onMouseDown={(event) => handleResizePointerDown(event, 'top-left')} onPointerMove={handleResizePointerMove} onPointerUp={handleResizePointerUp} onPointerCancel={(event) => handleResizePointerUp(event, true)} /><button className="resize-handle resize-handle-top-right" type="button" aria-label={copy.resizeTopRight} title={copy.resizeTopRight} onPointerDown={(event) => handleResizePointerDown(event, 'top-right')} onMouseDown={(event) => handleResizePointerDown(event, 'top-right')} onPointerMove={handleResizePointerMove} onPointerUp={handleResizePointerUp} onPointerCancel={(event) => handleResizePointerUp(event, true)} /><button className="resize-handle resize-handle-bottom-left" type="button" aria-label={copy.resizeBottomLeft} title={copy.resizeBottomLeft} onPointerDown={(event) => handleResizePointerDown(event, 'bottom-left')} onMouseDown={(event) => handleResizePointerDown(event, 'bottom-left')} onPointerMove={handleResizePointerMove} onPointerUp={handleResizePointerUp} onPointerCancel={(event) => handleResizePointerUp(event, true)} /><button className="resize-handle resize-handle-bottom-right" type="button" aria-label={copy.resizeBottomRight} title={copy.resizeBottomRight} onPointerDown={(event) => handleResizePointerDown(event, 'bottom-right')} onMouseDown={(event) => handleResizePointerDown(event, 'bottom-right')} onPointerMove={handleResizePointerMove} onPointerUp={handleResizePointerUp} onPointerCancel={(event) => handleResizePointerUp(event, true)} /><span className="selection-size-label">{Math.round(selectionBox.width)} × {Math.round(selectionBox.height)}</span></div>) }
            </div>
          ) : (
            <div className={`source-editor-wrap ${sourceDisplayMode === 'tree' ? 'source-tree-mode' : ''}`}>
              {sourceDisplayMode === 'tree' ? <div className="source-tree" role="tree" aria-label={copy.sourceTree}>
                {sourceRows.map((row) => row.type === 'fold' ? <div key={`fold-${row.lineIndex}`} className="source-fold-row"><span className="source-line-number">…</span><span>{copy.collapsedContent}</span></div> : <div key={row.lineIndex} className={`source-code-row ${row.item && selectedIds.includes(row.item.id) ? 'selected' : ''}`} ref={(node) => { if (!row.item) return; if (node) sourceRowRefs.current.set(row.item.id, node); else sourceRowRefs.current.delete(row.item.id) }} role={row.item ? 'treeitem' : undefined} onClick={() => row.item && selectSourceItem(row.item)} onDoubleClick={() => setSourceDisplayMode('edit')}>
                  <span className="source-line-number">{row.lineIndex + 1}</span><button className="source-fold-button" type="button" tabIndex={row.item?.tag === 'g' ? 0 : -1} aria-label={row.item?.tag === 'g' ? (expandedGroups[row.item.id] === false ? copy.expandGroup : copy.collapseGroup) : undefined} onClick={(event) => { if (!row.item || row.item.tag !== 'g') return; event.stopPropagation(); toggleGroup(row.item, event) }}>{row.item?.tag === 'g' ? <Icon name="chevron" size={12} /> : null}</button><code dangerouslySetInnerHTML={{ __html: highlightSvgSource(row.line) }} />
                </div>)}
              </div> : <><pre ref={sourceHighlightRef} className="source-highlight" aria-hidden="true" dangerouslySetInnerHTML={{ __html: highlightedSource }} /><textarea className="source-editor" value={sourceDraft} onChange={(event) => setSourceDraft(event.target.value)} onScroll={syncSourceScroll} onBlur={() => { if (!sourceDraft.trim()) return; try { commitSourceMarkup(sourceDraft); setSourceDisplayMode('tree') } catch { showToast(copy.invalidSvg, 'error') } }} spellCheck="false" /></>}
              {!sourceDraft.trim() && <div className="source-empty-state"><p>{copy.emptySource}</p><button className="button button-accent" type="button" onClick={loadDemo}>{copy.loadDemo}</button></div>}
            </div>
          )}
          {toast && <div key={toast.id} className={`toast ${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}><Icon name={toast.kind === 'error' ? 'x' : 'check'} size={15} /><span>{toast.message}</span><button type="button" className="toast-close" aria-label={copy.close} onClick={() => { if (toastTimerRef.current) { window.clearTimeout(toastTimerRef.current); toastTimerRef.current = 0 } setToast(null) }}><Icon name="x" size={13} /></button></div>}
          <div className="canvas-status"><span><span className="live-dot" /> {copy.livePreview}</span><span>{elements.length} {copy.statusReady}</span><span className="status-path">{selected ? `${copy.selected}: ${selectedDisplayName}` : copy.noSelection}</span></div>
        </section>

  )
}
