import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

function getPreviewUrl(markup) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`
}

export default function RecentSvgModal({ copy, documents, onClose, onOpen, onRemove }) {
  const [previewDocument, setPreviewDocument] = useState(null)
  const [previewZoom, setPreviewZoom] = useState(1)
  const [previewPan, setPreviewPan] = useState({ x: 0, y: 0 })
  const overlayRef = useRef(null)
  const previewStageRef = useRef(null)
  const previewZoomRef = useRef(1)
  const previewPanRef = useRef({ x: 0, y: 0 })
  const previewPointersRef = useRef(new Map())
  const previewPointerTapStartsRef = useRef(new Map())
  const previewPinchRef = useRef(null)
  const previewTouchPinchRef = useRef(null)
  const lastPreviewTapRef = useRef(0)
  const previewWasTouchPinchingRef = useRef(false)
  const lastPreviewPointerTapRef = useRef(0)
  const previewWasPointerPinchingRef = useRef(false)
  const lastPreviewClickRef = useRef(0)
  const setPreviewPosition = (x, y) => {
    const next = { x, y }
    previewPanRef.current = next
    setPreviewPan(next)
  }
  const setPreviewScale = (value) => {
    const next = Math.min(3, Math.max(1, value))
    previewZoomRef.current = next
    setPreviewZoom(next)
    if (next === 1 && (previewPanRef.current.x || previewPanRef.current.y)) setPreviewPosition(0, 0)
  }
  const closePreview = () => {
    previewPointersRef.current.clear()
    previewPointerTapStartsRef.current.clear()
    previewPinchRef.current = null
    previewTouchPinchRef.current = null
    setPreviewScale(1)
    setPreviewPosition(0, 0)
    setPreviewDocument(null)
  }
  const openPreview = (document) => {
    previewPointersRef.current.clear()
    previewPointerTapStartsRef.current.clear()
    previewPinchRef.current = null
    previewTouchPinchRef.current = null
    setPreviewScale(1)
    setPreviewPosition(0, 0)
    setPreviewDocument(document)
  }
  const resetPreviewView = () => {
    previewPointersRef.current.clear()
    previewPointerTapStartsRef.current.clear()
    previewPinchRef.current = null
    previewTouchPinchRef.current = null
    setPreviewScale(1)
    setPreviewPosition(0, 0)
  }
  const updatePreviewPinch = () => {
    const pointers = [...previewPointersRef.current.values()]
    if (pointers.length !== 2 || !previewPinchRef.current) return
    const distance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y)
    const pinch = previewPinchRef.current
    const zoom = Math.min(3, Math.max(1, pinch.startZoom * distance / pinch.startDistance))
    setPreviewScale(zoom)
    if (zoom > 1) setPreviewPosition(pinch.startPan.x + (pointers[0].x + pointers[1].x) / 2 - pinch.startCenter.x, pinch.startPan.y + (pointers[0].y + pointers[1].y) / 2 - pinch.startCenter.y)
  }
  const handlePreviewPointerDown = (event) => {
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch {}
    previewPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    previewPointerTapStartsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY, time: Date.now() })
    const pointers = [...previewPointersRef.current.values()]
    if (pointers.length === 2) {
      previewWasPointerPinchingRef.current = true
      previewPinchRef.current = { startDistance: Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y), startZoom: previewZoomRef.current, startCenter: { x: (pointers[0].x + pointers[1].x) / 2, y: (pointers[0].y + pointers[1].y) / 2 }, startPan: previewPanRef.current }
    }
  }
  const handlePreviewPointerMove = (event) => {
    if (!previewPointersRef.current.has(event.pointerId)) return
    previewPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    updatePreviewPinch()
  }
  const handlePreviewPointerEnd = (event) => {
    const start = previewPointerTapStartsRef.current.get(event.pointerId)
    const wasPinching = previewWasPointerPinchingRef.current
    previewPointersRef.current.delete(event.pointerId)
    previewPointerTapStartsRef.current.delete(event.pointerId)
    if (previewPointersRef.current.size < 2) previewPinchRef.current = null
    if (event.type === 'pointercancel') {
      if (!previewPointersRef.current.size) previewWasPointerPinchingRef.current = false
      return
    }
    if (previewPointersRef.current.size || wasPinching || !start) {
      if (!previewPointersRef.current.size) previewWasPointerPinchingRef.current = false
      return
    }
    const isTap = Date.now() - start.time < 350 && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 14
    if (!isTap) return
    const now = Date.now()
    if (now - lastPreviewPointerTapRef.current < 350) {
      resetPreviewView()
      lastPreviewPointerTapRef.current = 0
    } else {
      lastPreviewPointerTapRef.current = now
    }
  }
  useEffect(() => {
    const closePreviewOnEscape = (event) => {
      if (event.key !== 'Escape' || !previewDocument) return
      event.preventDefault()
      event.stopImmediatePropagation()
      closePreview()
    }
    window.addEventListener('keydown', closePreviewOnEscape, true)
    return () => window.removeEventListener('keydown', closePreviewOnEscape, true)
  }, [previewDocument])
  useEffect(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    const originalViewport = viewportMeta?.getAttribute('content')
    viewportMeta?.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no')
    const isInsideOverlay = (event) => {
      const path = event.composedPath?.()
      return path ? path.includes(overlayRef.current) : overlayRef.current?.contains(event.target)
    }
    const preventPagePinch = (event) => {
      const touches = event.touches?.length || 0
      if (isInsideOverlay(event) && (touches > 1 || (typeof event.scale === 'number' && event.scale !== 1))) event.preventDefault()
    }
    const preventTrackpadPageZoom = (event) => {
      if (isInsideOverlay(event) && (event.ctrlKey || event.metaKey)) event.preventDefault()
    }
    const captureOptions = { passive: false, capture: true }
    document.addEventListener('touchstart', preventPagePinch, captureOptions)
    document.addEventListener('touchmove', preventPagePinch, captureOptions)
    document.addEventListener('wheel', preventTrackpadPageZoom, captureOptions)
    document.addEventListener('gesturestart', preventPagePinch, { passive: false })
    document.addEventListener('gesturechange', preventPagePinch, { passive: false })
    document.addEventListener('gestureend', preventPagePinch, { passive: false })
    return () => {
      if (originalViewport != null) viewportMeta?.setAttribute('content', originalViewport)
      document.removeEventListener('touchstart', preventPagePinch, true)
      document.removeEventListener('touchmove', preventPagePinch, true)
      document.removeEventListener('wheel', preventTrackpadPageZoom, true)
      document.removeEventListener('gesturestart', preventPagePinch)
      document.removeEventListener('gesturechange', preventPagePinch)
      document.removeEventListener('gestureend', preventPagePinch)
    }
  }, [])
  useEffect(() => {
    const stage = previewStageRef.current
    if (!stage || !previewDocument) return undefined
    const getTouchDistance = (touches) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)
    const getTouchCenter = (touches) => ({ x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 })
    const handleTouchStart = (event) => {
      if (event.touches.length !== 2) return
      event.preventDefault()
      previewWasTouchPinchingRef.current = true
      previewTouchPinchRef.current = { startDistance: getTouchDistance(event.touches), startZoom: previewZoomRef.current, startCenter: getTouchCenter(event.touches), startPan: previewPanRef.current }
    }
    const handleTouchMove = (event) => {
      if (event.touches.length !== 2 || !previewTouchPinchRef.current) return
      event.preventDefault()
      const pinch = previewTouchPinchRef.current
      const zoom = Math.min(3, Math.max(1, pinch.startZoom * getTouchDistance(event.touches) / pinch.startDistance))
      setPreviewScale(zoom)
      if (zoom > 1) {
        const center = getTouchCenter(event.touches)
        setPreviewPosition(pinch.startPan.x + center.x - pinch.startCenter.x, pinch.startPan.y + center.y - pinch.startCenter.y)
      }
    }
    const handleTouchEnd = (event) => {
      if (event.touches.length >= 2) return
      previewTouchPinchRef.current = null
      if (event.touches.length) return
      if (!previewWasTouchPinchingRef.current) {
        const now = Date.now()
        if (now - lastPreviewTapRef.current < 300) {
          resetPreviewView()
          lastPreviewTapRef.current = 0
        } else {
          lastPreviewTapRef.current = now
        }
      }
      previewWasTouchPinchingRef.current = false
    }
    const handleWheel = (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        setPreviewScale(previewZoomRef.current * Math.exp(-event.deltaY * 0.01))
        return
      }
      if (previewZoomRef.current <= 1) return
      event.preventDefault()
      const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1
      setPreviewPosition(previewPanRef.current.x - event.deltaX * multiplier, previewPanRef.current.y - event.deltaY * multiplier)
    }
    const handleClick = (event) => {
      const now = Date.now()
      if (event.detail >= 2 || now - lastPreviewClickRef.current < 400) {
        resetPreviewView()
        lastPreviewClickRef.current = 0
        return
      }
      lastPreviewClickRef.current = now
    }
    const options = { passive: false }
    stage.addEventListener('touchstart', handleTouchStart, options)
    stage.addEventListener('touchmove', handleTouchMove, options)
    stage.addEventListener('touchend', handleTouchEnd)
    stage.addEventListener('touchcancel', handleTouchEnd)
    stage.addEventListener('wheel', handleWheel, options)
    stage.addEventListener('click', handleClick)
    return () => {
      stage.removeEventListener('touchstart', handleTouchStart)
      stage.removeEventListener('touchmove', handleTouchMove)
      stage.removeEventListener('touchend', handleTouchEnd)
      stage.removeEventListener('touchcancel', handleTouchEnd)
      stage.removeEventListener('wheel', handleWheel)
      stage.removeEventListener('click', handleClick)
    }
  }, [previewDocument])
  return <div ref={overlayRef} className="shortcuts-overlay recent-svg-overlay" onClick={onClose}>
    <div className="shortcuts-modal recent-svg-modal" role="dialog" aria-modal="true" aria-label={copy.recentSvgs} onClick={(event) => event.stopPropagation()}>
      <div className="shortcuts-header"><span>{copy.recentSvgs}</span><button className="mini-button" type="button" title={copy.close} aria-label={copy.close} onClick={onClose}><Icon name="x" size={14} /></button></div>
      <div className="recent-svg-list">
        {documents.length ? documents.map((document) => <div className="recent-svg-item" key={document.fileName}><button className="recent-svg-thumbnail" type="button" title={copy.expandRecentSvgPreview} aria-label={`${copy.expandRecentSvgPreview}: ${document.fileName}`} onClick={() => openPreview(document)}><img src={getPreviewUrl(document.svgMarkup)} alt="" /></button><button className="recent-svg-open" type="button" onClick={() => onOpen(document)}><Icon name="history" size={15} /><span>{document.fileName}</span></button><button className="recent-svg-remove" type="button" title={copy.removeRecentSvg} aria-label={`${copy.removeRecentSvg}: ${document.fileName}`} onClick={() => { if (previewDocument?.fileName === document.fileName) closePreview(); onRemove(document.fileName) }}><Icon name="trash" size={14} /></button></div>) : <p>{copy.recentSvgsEmpty}</p>}
      </div>
    </div>
    {previewDocument && <div className="recent-svg-preview-overlay" onClick={(event) => { event.stopPropagation(); closePreview() }}><div className="recent-svg-preview-dialog" role="dialog" aria-modal="true" aria-label={`${copy.recentSvgPreview}: ${previewDocument.fileName}`} onClick={(event) => event.stopPropagation()}><button className="mini-button recent-svg-preview-close" type="button" title={copy.close} aria-label={copy.close} onClick={closePreview}><Icon name="x" size={14} /></button><div ref={previewStageRef} className="recent-svg-preview-zoom-stage" onDoubleClick={resetPreviewView} onPointerDown={handlePreviewPointerDown} onPointerMove={handlePreviewPointerMove} onPointerUp={handlePreviewPointerEnd} onPointerCancel={handlePreviewPointerEnd}><img style={{ transform: `translate3d(${previewPan.x}px, ${previewPan.y}px, 0) scale(${previewZoom})` }} src={getPreviewUrl(previewDocument.svgMarkup)} alt={previewDocument.fileName} /></div></div></div>}
  </div>
}
