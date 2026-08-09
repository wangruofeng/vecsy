import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { COPY, LANGUAGES, ADD_LAYER_TAGS, getLayerDisplayName, getTagDisplayName } from './app/copy.js'
import { registerRuntimeIdentity } from './app/runtime-identity.js'
import Icon from './components/Icon.jsx'
import LayerPanel from './components/LayerPanel.jsx'
import CanvasPanel from './components/CanvasPanel.jsx'
import InspectorPanel from './components/InspectorPanel.jsx'
import SvgCollectionModal from './components/SvgCollectionModal.jsx'
import RecentSvgModal from './components/RecentSvgModal.jsx'
import useEditorDocument from './hooks/useEditorDocument.js'
import useCanvasInteraction from './hooks/useCanvasInteraction.js'
import { getAncestorGroupIds, getColor, getSvgColorTokens, getVisibleLayerItems, isElementHidden, setElementVisibility } from './editor/svg-parser.js'
import { getSvgDimensions, getTopLevelSelectedIds } from './editor/svg-geometry.js'
import { processSvgInput } from './editor/process-svg-input.js'
import { editSvgDocument } from './editor/edit-svg-document.js'
import { compactSvgTranslateTransforms, copyLayerMarkup, createCollectionSvgLayerMarkup, createImageLayerMarkup, createLayerMarkup, cropSvgToBounds, filterSvgToLayerIds, formatSvgMarkup, getEditableTextContent, getElementPaint, getPolygonSides, getTextGradientConfig, highlightSvgSource, insertClonedLayer, minifySvg, reorderSiblingElements, replaceSvgColorToken, sanitizeForExport, syncTextLineLayout, updatePolygonSides as updatePolygonSidesMarkup, updateTextGradient, withExplicitSize } from './editor/svg-transforms.js'

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 480">
  <g id="background" data-name="Background">
    <rect width="720" height="480" rx="24" fill="#F4F1EA" />
  </g>
  <g id="logo-mark" data-name="Logo mark">
    <circle cx="360" cy="194" r="92" fill="#F2A93B" />
    <path d="M300 222c30-104 180-108 182-5 1 55-44 87-101 87-54 0-88-29-81-82Z" fill="#23211D" />
  </g>
  <text id="wordmark" data-name="Wordmark" x="360" y="370" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="54" letter-spacing="5" fill="#1A1815">VECSY</text>
</svg>`

const STORAGE_KEY = 'vecsy:document'
const LEGACY_STORAGE_KEY = 'vectsy:document'
const HISTORY_LIMIT = 50

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function renderRasterExport(markup, width, height, format) {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }))
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0, width, height)
      URL.revokeObjectURL(imageUrl)
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not encode image')), `image/${format}`, 0.92)
    }
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl)
      reject(new Error('Could not load SVG'))
    }
    image.src = imageUrl
  })
}

function App() {
  const { language, setLanguage, svgMarkup, sourceDraft, setSourceDraft, elements, selectedId, setSelectedId, selectedIds, setSelectedIds, fileName, dirty, setDirty, history, storageError, setStorageError, selectLayerIds, currentSnapshot, commitDocument, undo, redo, loadDocument, recentDocuments, removeRecentDocument } = useEditorDocument({ initialMarkup: SAMPLE_SVG, storageKey: STORAGE_KEY, legacyStorageKey: LEGACY_STORAGE_KEY, historyLimit: HISTORY_LIMIT })
  const [activeTab, setActiveTab] = useState('preview')
  const [isLayersOpen, setIsLayersOpen] = useState(true)
  const [isInspectorOpen, setIsInspectorOpen] = useState(true)
  const [addLayerMenuOpen, setAddLayerMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [showSvgCollection, setShowSvgCollection] = useState(false)
  const [showRecentSvgs, setShowRecentSvgs] = useState(false)
  const [toast, setToast] = useState(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [isFileDragOver, setIsFileDragOver] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState('svg')
  const [exportScale, setExportScale] = useState(2)
  const [exportOptimize, setExportOptimize] = useState(true)
  const [exportSelectedOnly, setExportSelectedOnly] = useState(false)
  const [exportLayerIds, setExportLayerIds] = useState([])
  const [exportBounds, setExportBounds] = useState(null)
  const [exportSizes, setExportSizes] = useState(null)
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false)
  const [exportPreviewZoom, setExportPreviewZoom] = useState(1)
  const [contextMenu, setContextMenu] = useState(null)
  const [renamingLayerId, setRenamingLayerId] = useState('')
  const [renameDraft, setRenameDraft] = useState('')
  const [expandedGroups, setExpandedGroups] = useState({})
  const [sourceDisplayMode, setSourceDisplayMode] = useState('edit')
  const [draggingLayerId, setDraggingLayerId] = useState('')
  const [dragOverLayerId, setDragOverLayerId] = useState('')
  const [editingTextId, setEditingTextId] = useState('')
  const [textDraft, setTextDraft] = useState('')
  const [textFieldDraft, setTextFieldDraft] = useState('')
  const [attributeDrafts, setAttributeDrafts] = useState({ targetId: '', values: {} })
  const fileInput = useRef(null)
  const imageInput = useRef(null)
  const layerRowRefs = useRef(new Map())
  const layerDragRef = useRef(null)
  const suppressLayerClickRef = useRef(false)
  const sourceHighlightRef = useRef(null)
  const clipboardLayerRef = useRef(null)
  const attributePreviewFrameRef = useRef(0)
  const pendingAttributeUpdatesRef = useRef(null)
  const attributeCommitTimerRef = useRef(0)
  const textGradientPreviewFrameRef = useRef(0)
  const pendingTextGradientRef = useRef(null)
  const textGradientCommitTimerRef = useRef(0)
  const colorTokenPreviewFrameRef = useRef(0)
  const pendingColorTokenRef = useRef(null)
  const colorTokenCommitTimerRef = useRef(0)
  const toastTimerRef = useRef(0)
  const fileDragCounterRef = useRef(0)
  const renameInputRef = useRef(null)
  const renameInitialDraftRef = useRef('')
  const textEditIdRef = useRef('')
  const arrowKeyHoldRef = useRef({ key: '', startedAt: 0 })
  const exportPreviewZoomRef = useRef(1)
  const exportPreviewPointersRef = useRef(new Map())
  const exportPreviewPinchRef = useRef(null)
  const copy = COPY[language]

  const showSecurityFeedback = (result) => {
    if (result.status !== 'sanitized') return
    const labels = {
      'blocked-element': copy.svgSafetyBlockedElement,
      'event-handler': copy.svgSafetyEventHandler,
      'external-url': copy.svgSafetyExternalUrl,
      'style-element': copy.svgSafetyStyleElement,
      'unsafe-style': copy.svgSafetyUnsafeStyle,
      'processing-instruction': copy.svgSafetyProcessingInstruction,
      link: copy.svgSafetyLink,
    }
    const details = Object.entries(result.removedFeatures).map(([feature, count]) => `${labels[feature] || feature} × ${count}`).join('， ')
    showToast(`${copy.svgSafetySanitized} ${details}`)
  }

  useLayoutEffect(() => {
    document.getElementById('root')?.removeAttribute('data-booting')
  }, [])

  const isShortcutCombo = (keys) => /⌘|Shift|Ctrl|Alt|\+/.test(keys)
  const shortcutGroups = [
    {
      title: copy.shortcutsGeneral,
      items: [
        ['⌘ Z', copy.shortcutUndo],
        ['⌘ ⇧ Z', copy.shortcutRedo],
        ['⌘ S', copy.shortcutExport],
        ['⌘ A', copy.shortcutSelectAll],
        ['⌘ C', copy.shortcutCopy],
        ['⌘ V', copy.shortcutPasteSvg],
        ['⌫', copy.shortcutDelete],
        ['⌘ \\', copy.shortcutPanels],
        ['?', copy.shortcutHelp],
      ],
    },
    {
      title: copy.shortcutsCanvas,
      items: [
        ['⌘ =', copy.shortcutZoomIn],
        ['⌘ -', copy.shortcutZoomOut],
        ['⌘ 0', copy.shortcutZoomFit],
        [copy.shortcutKeyDrag, copy.shortcutPan],
        [copy.shortcutKeyScroll, copy.shortcutZoom],
        [copy.shortcutKeyDoubleClick, copy.shortcutEditText],
        ['Shift + Drag', copy.shortcutResizeProportional],
        ['↑ ↓ ← →', copy.shortcutMove],
        ['Esc', copy.shortcutDeselect],
      ],
    },
    {
      title: copy.shortcutsLayers,
      wide: true,
      items: [
        ['Shift + Click', copy.shortcutRangeSelect],
        ['⌘ + Click', copy.shortcutToggleSelect],
        ['⌘ G', copy.shortcutGroup],
      ],
    },
  ].map((group) => ({ ...group, items: [...group.items].sort((a, b) => Number(isShortcutCombo(a[0])) - Number(isShortcutCombo(b[0]))) }))

  const selected = elements.find((item) => item.id === selectedId)
  const selectedAttrs = selected ? selected.node : null
  const isSelectedHidden = isElementHidden(selectedAttrs)
  const selectedDisplayName = selected ? getLayerDisplayName(selected, language) : ''
  const contextMenuTarget = contextMenu ? elements.find((element) => element.id === contextMenu.targetId) : null
  const canvasInteraction = useCanvasInteraction({ activeTab, selectedId, selectedIds, selected, elements, svgMarkup, currentSnapshot, commitDocument, selectLayerIds })
  const { canvasRef, svgRef, svgPosition, setSvgPosition, svgScale, setSvgScale, isDraggingSvg, isDraggingElement, isResizingElement, isPinchingSvg, selectionBox, multiSelectionBoxes, lineEndpoints, hoveredLayerId, setHoveredLayerId, transientMarkup, updateTransientMarkup, clearTransientMarkup, zoomBy, fitToScreen, getElementSvgBounds, handleCanvasClick, handleCanvasPointerDown: handleCanvasPointerDownBase, handleCanvasPointerMove, handleCanvasPointerUp: handleCanvasPointerUpBase, handleResizePointerMove, handleResizePointerUp } = canvasInteraction
  const setTextEditing = (id) => {
    textEditIdRef.current = id
    setEditingTextId(id)
  }
  const handleSvgDoubleClick = (event) => canvasInteraction.handleSvgDoubleClick(event, setTextDraft, setTextEditing)
  const handleCanvasPointerDown = (event) => {
    if (textEditIdRef.current) commitTextEdit()
    handleCanvasPointerDownBase(event, setTextDraft, setTextEditing)
  }
  const handleCanvasPointerUp = (event, cancelled = false) => handleCanvasPointerUpBase(event, cancelled, setTextDraft, setTextEditing)
  const startTextEditFromInspector = (id, draft) => {
    setTextDraft(draft)
    setTextEditing(id)
  }
  const handleResizePointerDown = (event, handle) => canvasInteraction.handleResizePointerDown(event, handle)
  const renderedMarkup = transientMarkup || svgMarkup
  const getSelectedPaint = (attribute) => {
    if (selected?.tag === 'text') return getColor(getElementPaint(svgMarkup, selected.id, attribute))
    const directValue = selectedAttrs?.getAttribute(attribute)
    if (directValue) return getColor(directValue)
    if (selected?.tag !== 'g') return ''
    const values = [...new Set(Array.from(selectedAttrs.children).map((node) => getColor(node.getAttribute(attribute))).filter(Boolean))]
    return values.length === 1 ? values[0] : ''
  }
  const getDraftedAttribute = (attribute, fallback = '') => {
    if (attributeDrafts.targetId === selected?.id && Object.hasOwn(attributeDrafts.values, attribute)) return attributeDrafts.values[attribute]
    return selectedAttrs?.getAttribute(attribute) || fallback
  }
  const textFontSize = selected?.tag === 'text' ? getDraftedAttribute('font-size', '16') : '16'
  const textLetterSpacing = selected?.tag === 'text' ? getDraftedAttribute('letter-spacing', '0') : '0'
  const textFontFamily = selected?.tag === 'text' ? getDraftedAttribute('font-family') : ''
  const textFontWeight = selected?.tag === 'text' ? getDraftedAttribute('font-weight', 'normal') : 'normal'
  const isTextBold = textFontWeight === 'bold' || Number(textFontWeight) >= 600
  const polygonSides = selected?.tag === 'polygon' ? getPolygonSides(selectedAttrs?.getAttribute('points')) : 3
  const textGradient = selected?.tag === 'text' ? getTextGradientConfig(svgMarkup, selected.id) : null
  const visibleLayerItems = getVisibleLayerItems(elements, expandedGroups)
  const colorTokens = useMemo(() => getSvgColorTokens(svgMarkup), [svgMarkup])
  const highlightedSource = useMemo(() => highlightSvgSource(sourceDraft), [sourceDraft])

  useEffect(() => {
    document.documentElement.lang = language
    document.title = copy.documentTitle
  }, [language])

  useEffect(() => {
    if (selected?.tag === 'text') setTextFieldDraft(getEditableTextContent(selected.node))
    else setTextFieldDraft('')
    setAttributeDrafts({ targetId: '', values: {} })
    pendingAttributeUpdatesRef.current = null
    if (attributeCommitTimerRef.current) window.clearTimeout(attributeCommitTimerRef.current)
    attributeCommitTimerRef.current = 0
    if (attributePreviewFrameRef.current) cancelAnimationFrame(attributePreviewFrameRef.current)
    attributePreviewFrameRef.current = 0
    pendingTextGradientRef.current = null
    if (textGradientCommitTimerRef.current) window.clearTimeout(textGradientCommitTimerRef.current)
    textGradientCommitTimerRef.current = 0
    if (textGradientPreviewFrameRef.current) cancelAnimationFrame(textGradientPreviewFrameRef.current)
    textGradientPreviewFrameRef.current = 0
  }, [selectedId, svgMarkup])

  useEffect(() => {
    const handleOutsideLayerMenu = (event) => {
      if (!event.target?.closest?.('.add-layer-menu') && !event.target?.closest?.('.layers-add-button')) setAddLayerMenuOpen(false)
      if (!event.target?.closest?.('.language-menu-wrap')) setLangMenuOpen(false)
    }
    document.addEventListener('pointerdown', handleOutsideLayerMenu, true)
    return () => document.removeEventListener('pointerdown', handleOutsideLayerMenu, true)
  }, [])

  useEffect(() => {
    const ancestorIds = getAncestorGroupIds(elements, selectedId)
    if (!ancestorIds.length) return
    setExpandedGroups((current) => {
      const next = { ...current }
      let changed = false
      ancestorIds.forEach((id) => {
        if (next[id] === false) {
          next[id] = true
          changed = true
        }
      })
      return changed ? next : current
    })
  }, [elements, selectedId])

  useEffect(() => {
    const row = layerRowRefs.current.get(selectedId)
    if (!row) return
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    row.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [selectedId, visibleLayerItems.length])

  const showToast = (message, kind = 'success') => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    setToast({ id: Date.now(), kind, message })
    toastTimerRef.current = window.setTimeout(() => {
      toastTimerRef.current = 0
      setToast(null)
    }, 3200)
  }

  useEffect(() => {
    if (!storageError) return
    showToast(copy.storageFull, 'error')
    setStorageError(false)
  }, [storageError, copy.storageFull])

  useEffect(() => () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
  }, [])

  const previewAttributes = (updates) => {
    if (!selected) return
    const pending = pendingAttributeUpdatesRef.current
    const nextUpdates = pending?.targetId === selected.id ? { ...pending.updates, ...updates } : { ...updates }
    pendingAttributeUpdatesRef.current = { targetId: selected.id, updates: nextUpdates }
    setAttributeDrafts((current) => ({
      targetId: selected.id,
      values: current.targetId === selected.id ? { ...current.values, ...updates } : { ...updates },
    }))
    if (attributePreviewFrameRef.current) return
    attributePreviewFrameRef.current = requestAnimationFrame(() => {
      attributePreviewFrameRef.current = 0
      const next = pendingAttributeUpdatesRef.current
      if (!next) return
      updateTransientMarkup(editSvgDocument(svgMarkup, { type: 'set-attributes', targetId: next.targetId, updates: next.updates }).markup)
    })
  }

  const commitPreviewAttributes = () => {
    if (attributeCommitTimerRef.current) window.clearTimeout(attributeCommitTimerRef.current)
    attributeCommitTimerRef.current = 0
    const pending = pendingAttributeUpdatesRef.current
    if (!pending) return
    if (attributePreviewFrameRef.current) cancelAnimationFrame(attributePreviewFrameRef.current)
    attributePreviewFrameRef.current = 0
    pendingAttributeUpdatesRef.current = null
    const transaction = editSvgDocument(svgMarkup, { type: 'set-attributes', targetId: pending.targetId, updates: pending.updates })
    clearTransientMarkup()
    setAttributeDrafts({ targetId: '', values: {} })
    commitDocument(transaction.markup, { nextSelectedId: transaction.nextSelectedId })
  }

  // Preview an attribute change and auto-commit after a short idle window. Needed
  // because <input type="color"> on macOS never fires `blur` after the native
  // picker closes, so relying on onBlur alone would drop the change.
  const previewAttributeDebounced = (attribute, value) => {
    previewAttribute(attribute, value)
    if (attributeCommitTimerRef.current) window.clearTimeout(attributeCommitTimerRef.current)
    attributeCommitTimerRef.current = window.setTimeout(() => {
      attributeCommitTimerRef.current = 0
      commitPreviewAttributes()
    }, 450)
  }

  const previewTextGradient = (config) => {
    if (selected?.tag !== 'text') return
    pendingTextGradientRef.current = { targetId: selected.id, config }
    if (textGradientPreviewFrameRef.current) return
    textGradientPreviewFrameRef.current = requestAnimationFrame(() => {
      textGradientPreviewFrameRef.current = 0
      const pending = pendingTextGradientRef.current
      if (pending) updateTransientMarkup(updateTextGradient(svgMarkup, pending.targetId, pending.config))
    })
  }

  const commitTextGradient = () => {
    if (textGradientCommitTimerRef.current) window.clearTimeout(textGradientCommitTimerRef.current)
    textGradientCommitTimerRef.current = 0
    const pending = pendingTextGradientRef.current
    if (!pending) return
    if (textGradientPreviewFrameRef.current) cancelAnimationFrame(textGradientPreviewFrameRef.current)
    textGradientPreviewFrameRef.current = 0
    pendingTextGradientRef.current = null
    clearTransientMarkup()
    const nextMarkup = updateTextGradient(svgMarkup, pending.targetId, pending.config)
    if (nextMarkup !== svgMarkup) commitDocument(nextMarkup, { nextSelectedId: pending.targetId })
  }

  const previewTextGradientDebounced = (config) => {
    previewTextGradient(config)
    if (textGradientCommitTimerRef.current) window.clearTimeout(textGradientCommitTimerRef.current)
    textGradientCommitTimerRef.current = window.setTimeout(() => {
      textGradientCommitTimerRef.current = 0
      commitTextGradient()
    }, 450)
  }

  const previewColorToken = (sourceColor, nextColor) => {
    pendingColorTokenRef.current = { sourceColor, nextColor }
    if (colorTokenPreviewFrameRef.current) return
    colorTokenPreviewFrameRef.current = requestAnimationFrame(() => {
      colorTokenPreviewFrameRef.current = 0
      const pending = pendingColorTokenRef.current
      if (pending) updateTransientMarkup(replaceSvgColorToken(svgMarkup, pending.sourceColor, pending.nextColor))
    })
  }

  const commitColorToken = () => {
    if (colorTokenCommitTimerRef.current) window.clearTimeout(colorTokenCommitTimerRef.current)
    colorTokenCommitTimerRef.current = 0
    const pending = pendingColorTokenRef.current
    if (!pending) return
    if (colorTokenPreviewFrameRef.current) cancelAnimationFrame(colorTokenPreviewFrameRef.current)
    colorTokenPreviewFrameRef.current = 0
    pendingColorTokenRef.current = null
    clearTransientMarkup()
    const nextMarkup = replaceSvgColorToken(svgMarkup, pending.sourceColor, pending.nextColor)
    if (nextMarkup !== svgMarkup) commitDocument(nextMarkup, { nextSelectedId: selectedId, nextSelectedIds: selectedIds })
  }

  const previewColorTokenDebounced = (sourceColor, nextColor) => {
    previewColorToken(sourceColor, nextColor)
    if (colorTokenCommitTimerRef.current) window.clearTimeout(colorTokenCommitTimerRef.current)
    colorTokenCommitTimerRef.current = window.setTimeout(() => {
      colorTokenCommitTimerRef.current = 0
      commitColorToken()
    }, 450)
  }

  const handleTextAttributeKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  const loadSvg = (raw, name = 'untitled.svg', { silent = false, source = 'untrusted' } = {}) => {
    try {
      const result = processSvgInput(raw, { source })
      if (result.status === 'rejected') throw new Error('Invalid SVG')
      loadDocument(result.markup, name)
      setSvgPosition({ x: 0, y: 0 })
      setSvgScale(1)
      setExpandedGroups({})
      setSourceDisplayMode('edit')
      setActiveTab('preview')
      if (!silent) {
        showSecurityFeedback(result)
        if (result.status === 'accepted') showToast(`${copy.toastImported} ${name}`)
      }
    } catch {
      showToast(copy.invalidSvg, 'error')
    }
  }

  const renameDocument = (nextFileName) => {
    commitDocument(svgMarkup, { nextSelectedId: selectedId, nextSelectedIds: selectedIds, nextFileName, nextDirty: true })
  }

  const openRecentDocument = (document) => {
    loadSvg(document.svgMarkup, document.fileName, { silent: true })
    setShowRecentSvgs(false)
  }

  const commitSourceMarkup = (rawMarkup) => {
    const result = processSvgInput(rawMarkup)
    if (result.status === 'rejected') throw new Error('Invalid SVG')
    commitDocument(result.markup, { nextSelectedId: selectedId })
    showSecurityFeedback(result)
  }

  useEffect(() => {
    const handleHistoryShortcut = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.key.toLowerCase() !== 'z') return
      if (event.target?.closest?.('input, textarea, [contenteditable="true"]')) return
      const action = event.shiftKey ? redo : undo
      const canRun = event.shiftKey ? history.future.length : history.past.length
      if (!canRun) return
      event.preventDefault()
      action()
    }
    window.addEventListener('keydown', handleHistoryShortcut)
    return () => window.removeEventListener('keydown', handleHistoryShortcut)
  }, [dirty, fileName, history, selectedId, svgMarkup])

  const previewAttribute = (attribute, value) => previewAttributes({ [attribute]: value })

  const previewRectRadius = (value) => {
    if (!selected || selected.tag !== 'rect') return
    const nextValue = value === '' || value == null || Number(value) === 0 ? '' : value
    previewAttributes({ rx: nextValue, ry: nextValue })
  }

  const updateRectAspectRatio = (ratio) => {
    if (!selected || selected.tag !== 'rect') return
    const width = Number(rectWidthValue)
    if (!Number.isFinite(width) || width <= 0) return
    const originalWidth = selectedAttrs?.getAttribute('data-editor-original-width')
    const originalHeight = selectedAttrs?.getAttribute('data-editor-original-height')
    const updates = ratio ? {
      width: String(width),
      height: String(Number((width / ratio).toFixed(2))),
      'data-editor-original-width': originalWidth || String(width),
      'data-editor-original-height': originalHeight || rectHeightValue,
    } : originalWidth && originalHeight ? {
      width: originalWidth,
      height: originalHeight,
      'data-editor-original-width': null,
      'data-editor-original-height': null,
    } : null
    if (!updates) return
    const transaction = editSvgDocument(svgMarkup, { type: 'set-attributes', targetId: selected.id, updates })
    if (transaction.changed) commitDocument(transaction.markup, { nextSelectedId: transaction.nextSelectedId })
  }

  const updatePolygonSides = (value) => {
    if (!selected || selected.tag !== 'polygon') return
    const nextMarkup = updatePolygonSidesMarkup(svgMarkup, selected.id, value)
    if (nextMarkup !== svgMarkup) commitDocument(nextMarkup, { nextSelectedId: selected.id })
  }

  const commitTextEdit = (nextText = textDraft) => {
    const editId = textEditIdRef.current
    if (!editId) return
    textEditIdRef.current = ''
    const doc = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
    const node = doc.querySelector(`[data-editor-id="${editId}"]`)
    if (node) {
      node.textContent = nextText
      syncTextLineLayout(node)
      const nextMarkup = new XMLSerializer().serializeToString(doc.documentElement)
      commitDocument(nextMarkup, { nextSelectedId: editId })
    }
    setEditingTextId('')
  }

  const commitTextField = () => {
    if (!selected || selected.tag !== 'text') return
    const doc = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
    const node = doc.querySelector(`[data-editor-id="${selected.id}"]`)
    if (!node || getEditableTextContent(node) === textFieldDraft) return
    node.textContent = textFieldDraft
    syncTextLineLayout(node)
    const nextMarkup = new XMLSerializer().serializeToString(doc.documentElement)
    commitDocument(nextMarkup, { nextSelectedId: selected.id })
  }

  const cancelTextEdit = () => {
    setTextEditing('')
  }

  const toggleVisibility = (item, event) => {
    event.stopPropagation()
    const doc = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
    const node = doc.querySelector(`[data-editor-id="${item.id}"]`)
    if (!node) return
    setElementVisibility(node, !isElementHidden(node))
    const nextMarkup = new XMLSerializer().serializeToString(doc.documentElement)
    commitDocument(nextMarkup, { nextSelectedId: item.id })
  }

  const toggleGroup = (item, event) => {
    event.stopPropagation()
    setExpandedGroups((current) => ({ ...current, [item.id]: current[item.id] === false }))
  }

  const handleLayerMouseDown = (event, item) => {
    if (event.target?.closest?.('button')) {
      return
    }
    layerDragRef.current = { id: item.id, startY: event.clientY, active: false }
  }

  const clearLayerDrag = () => {
    setDraggingLayerId('')
    setDragOverLayerId('')
  }

  useEffect(() => {
    const handleLayerMouseMove = (event) => {
      const drag = layerDragRef.current
      if (!drag) return
      if (!drag.active && Math.abs(event.clientY - drag.startY) < 4) return
      if (!drag.active) {
        drag.active = true
        setDraggingLayerId(drag.id)
      }
      event.preventDefault()
      const targetRow = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('.layer-row')
      setDragOverLayerId(targetRow?.getAttribute('data-layer-id') || '')
    }

    const handleLayerMouseUp = (event) => {
      const drag = layerDragRef.current
      if (!drag) return
      if (drag.active) {
        event.preventDefault()
        suppressLayerClickRef.current = true
        const targetId = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('.layer-row')?.getAttribute('data-layer-id') || ''
        const nextMarkup = targetId && targetId !== drag.id ? reorderSiblingElements(svgMarkup, drag.id, targetId) : svgMarkup
        clearLayerDrag()
        if (nextMarkup !== svgMarkup) commitDocument(nextMarkup, { nextSelectedId: drag.id })
      }
      layerDragRef.current = null
    }

    const cancelLayerDrag = () => {
      if (!layerDragRef.current) return
      layerDragRef.current = null
      clearLayerDrag()
    }

    window.addEventListener('mousemove', handleLayerMouseMove)
    window.addEventListener('mouseup', handleLayerMouseUp)
    window.addEventListener('blur', cancelLayerDrag)
    return () => {
      window.removeEventListener('mousemove', handleLayerMouseMove)
      window.removeEventListener('mouseup', handleLayerMouseUp)
      window.removeEventListener('blur', cancelLayerDrag)
    }
  }, [svgMarkup])

  const handleFile = (file) => {
    if (!file) return
    if (!/\.svg$/i.test(file.name) && file.type !== 'image/svg+xml') {
      showToast(copy.toastInvalidFile, 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => loadSvg(String(reader.result), file.name)
    reader.onerror = () => showToast(copy.invalidSvg, 'error')
    reader.readAsText(file)
  }

  const addLayer = (tag) => {
    const textContent = copy.newLayerText
    const created = createLayerMarkup(svgMarkup, tag, textContent)
    commitDocument(created.markup, { nextSelectedId: created.id })
    setAddLayerMenuOpen(false)
    setActiveTab('preview')
    if (tag === 'text') {
      setTextDraft(textContent)
      setTextEditing(created.id)
    }
  }

  const openImagePicker = () => {
    setAddLayerMenuOpen(false)
    imageInput.current?.click()
  }

  const addImageLayer = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast(copy.toastInvalidImageFile, 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const created = createImageLayerMarkup(svgMarkup, { name: file.name, href: String(reader.result), width: image.naturalWidth, height: image.naturalHeight })
        commitDocument(created.markup, { nextSelectedId: created.id })
        setActiveTab('preview')
      }
      image.onerror = () => showToast(copy.toastInvalidImageFile, 'error')
      image.src = String(reader.result)
    }
    reader.onerror = () => showToast(copy.toastInvalidImageFile, 'error')
    reader.readAsDataURL(file)
  }

  const openSvgCollection = () => {
    setAddLayerMenuOpen(false)
    setShowSvgCollection(true)
  }

  const addSvgCollectionItem = async (item) => {
    try {
      const sourceMarkup = item.svgMarkup || item.inlineSvgMarkup || await fetch(item.editableUrl || item.url).then((response) => {
        if (!response.ok) throw new Error('Unable to load SVG collection item.')
        return response.text()
      })
      const result = processSvgInput(sourceMarkup, { source: item.source || 'app-owned' })
      if (result.status === 'rejected') throw new Error('Invalid SVG collection item.')
      const created = createCollectionSvgLayerMarkup(svgMarkup, { name: item.name, svgMarkup: result.markup, preserveAppearance: item.preserveAppearance })
      commitDocument(created.markup, { nextSelectedId: created.id })
      showSecurityFeedback(result)
      setShowSvgCollection(false)
      setActiveTab('preview')
    } catch {
      showToast(copy.toastCollectionImportFailed, 'error')
    }
  }

  const copySelectedLayer = (event) => {
    if (!selected) return
    const markup = copyLayerMarkup(svgMarkup, selected.id)
    if (!markup) return
    clipboardLayerRef.current = markup
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(markup).catch(() => {})
    event?.preventDefault()
    showToast(copy.toastCopy)
  }

  const pasteLayer = (event) => {
    if (!selected || !clipboardLayerRef.current) return
    const pastedId = `node-paste-${Date.now()}`
    const nextMarkup = insertClonedLayer(svgMarkup, clipboardLayerRef.current, selected.id, pastedId)
    if (nextMarkup === svgMarkup) return
    event?.preventDefault()
    commitDocument(nextMarkup, { nextSelectedId: pastedId })
    setActiveTab('preview')
    showToast(copy.toastPaste)
  }

  useEffect(() => {
    const handleSvgPaste = (event) => {
      if (event.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return
      const markup = event.clipboardData?.getData('image/svg+xml') || event.clipboardData?.getData('text/plain') || ''
      if (/^(?:\uFEFF?\s*)?(?:<\?xml[\s\S]*?\?>\s*)?<svg(?:\s|>)/i.test(markup)) {
        try {
          const result = processSvgInput(markup)
          if (result.status === 'rejected') throw new Error('Invalid SVG')
          commitDocument(result.markup, { nextSelectedId: '', nextSelectedIds: [] })
          event.preventDefault()
          setSvgPosition({ x: 0, y: 0 })
          setSvgScale(1)
          setExpandedGroups({})
          setSourceDisplayMode('edit')
          setActiveTab('preview')
          showSecurityFeedback(result)
          if (result.status === 'accepted') showToast(`${copy.toastImported} SVG`)
        } catch {
          event.preventDefault()
          showToast(copy.invalidSvg, 'error')
        }
        return
      }
      pasteLayer(event)
    }
    window.addEventListener('paste', handleSvgPaste)
    return () => window.removeEventListener('paste', handleSvgPaste)
  }, [copy.invalidSvg, copy.toastImported, selected, svgMarkup])

  const deleteSelectedLayer = (event) => {
    if (!selectedIds.length) return
    const transaction = editSvgDocument(svgMarkup, { type: 'remove', targetIds: selectedIds })
    if (!transaction.changed) return
    event?.preventDefault()
    commitDocument(transaction.markup, { nextSelectedId: transaction.nextSelectedId, nextSelectedIds: transaction.nextSelectedIds })
    showToast(copy.toastDelete)
  }

  const groupSelectedLayers = (event) => {
    const transaction = editSvgDocument(svgMarkup, { type: 'group', targetIds: selectedIds })
    if (!transaction.changed) return
    event?.preventDefault()
    commitDocument(transaction.markup, { nextSelectedId: transaction.nextSelectedId, nextSelectedIds: transaction.nextSelectedIds })
    showToast(copy.toastGrouped)
  }

  const cyclePanels = () => {
    if (isLayersOpen && isInspectorOpen) {
      setIsLayersOpen(false)
    } else if (!isLayersOpen && isInspectorOpen) {
      setIsInspectorOpen(false)
    } else if (!isLayersOpen && !isInspectorOpen) {
      setIsLayersOpen(true)
    } else {
      setIsInspectorOpen(true)
    }
  }

  const moveSelectedLayers = (dx, dy) => {
    if (!selectedIds.length) return
    const targetIds = getTopLevelSelectedIds(svgMarkup, selectedIds)
    const transaction = editSvgDocument(svgMarkup, { type: 'translate', targetIds, selectedId, selectedIds, delta: { x: dx, y: dy } })
    if (transaction.changed) commitDocument(transaction.markup, { nextSelectedId: transaction.nextSelectedId, nextSelectedIds: transaction.nextSelectedIds })
  }

  useEffect(() => {
    const handleEditorShortcuts = (event) => {
      const target = event.target
      const interactive = target?.closest?.('input, textarea, select, [contenteditable="true"]')
      if (interactive) {
        // 例外：Inspector 的颜色/数值调参框——Backspace 退到框首（无可删字符）后再按，则删图层。
        // 其余输入框（搜索 / 重命名 / 源码 / 文本编辑）仍保留原生退格删字符。
        const isDeleteKey = event.key === 'Backspace' || event.key === 'Delete'
        const isInspectorValueInput = target?.tagName === 'INPUT' && (target.type === 'color' || !!target.closest?.('.color-field, .numeric-field'))
        const noCharToDelete = target?.type === 'color' || (target?.selectionStart == null ? target?.value === '' : target.selectionStart === 0 && target.selectionEnd === 0)
        if (!(isDeleteKey && isInspectorValueInput && noCharToDelete)) return
      }
      const key = event.key.toLowerCase()
      const modifier = event.metaKey || event.ctrlKey
      if (key === 'escape') {
        if (contextMenu) {
          setContextMenu(null)
          return
        }
        if (exportOpen) {
          if (exportPreviewOpen) {
            closeExportPreview()
            return
          }
          setExportOpen(false)
          return
        }
        if (renamingLayerId) {
          setRenamingLayerId('')
          return
        }
        if (showShortcuts) {
          setShowShortcuts(false)
          return
        }
        if (showSvgCollection) {
          setShowSvgCollection(false)
          return
        }
        if (showRecentSvgs) {
          setShowRecentSvgs(false)
          return
        }
        setSelectedId('')
        setSelectedIds([])
        return
      }
      if (!modifier && !event.altKey && event.key === '?') {
        event.preventDefault()
        setShowShortcuts((current) => !current)
        return
      }
      if (modifier && key === 's') {
        event.preventDefault()
        exportSvg()
        return
      }
      if (modifier && (event.key === '=' || event.key === '+')) {
        event.preventDefault()
        zoomBy(1.25)
        return
      }
      if (modifier && event.key === '-') {
        event.preventDefault()
        zoomBy(0.8)
        return
      }
      if (modifier && event.key === '0') {
        event.preventDefault()
        fitToScreen()
        return
      }
      if (modifier && (event.key === '\\' || event.code === 'Backslash')) {
        event.preventDefault()
        cyclePanels()
        return
      }
      if (modifier && key === 'a') {
        event.preventDefault()
        selectLayerIds(elements.map((item) => item.id), selectedId)
        return
      }
      if (modifier && key === 'g') {
        event.preventDefault()
        groupSelectedLayers(event)
        return
      }
      if (modifier && key === 'c') {
        copySelectedLayer(event)
        return
      }
      if (!modifier && !event.altKey && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        const now = performance.now()
        if (!event.repeat || arrowKeyHoldRef.current.key !== event.key) arrowKeyHoldRef.current = { key: event.key, startedAt: now }
        const heldFor = now - arrowKeyHoldRef.current.startedAt
        const multiplier = heldFor >= 850 ? 8 : heldFor >= 450 ? 3 : 1
        const step = (event.shiftKey ? 10 : 1) * multiplier
        const moves = { ArrowUp: [0, -step], ArrowDown: [0, step], ArrowLeft: [-step, 0], ArrowRight: [step, 0] }
        event.preventDefault()
        moveSelectedLayers(...moves[event.key])
        return
      }
      if (key === 'delete' || key === 'backspace') deleteSelectedLayer(event)
    }
    const resetArrowKeyHold = (event) => {
      if (!event || event.key === arrowKeyHoldRef.current.key) arrowKeyHoldRef.current = { key: '', startedAt: 0 }
    }
    window.addEventListener('keydown', handleEditorShortcuts)
    window.addEventListener('keyup', resetArrowKeyHold)
    window.addEventListener('blur', resetArrowKeyHold)
    return () => {
      window.removeEventListener('keydown', handleEditorShortcuts)
      window.removeEventListener('keyup', resetArrowKeyHold)
      window.removeEventListener('blur', resetArrowKeyHold)
    }
  }, [selectedId, selectedIds, elements, svgMarkup, fileName, dirty, history, isLayersOpen, isInspectorOpen, showShortcuts, svgScale, contextMenu, exportOpen, exportPreviewOpen, renamingLayerId, showSvgCollection, showRecentSvgs])

  const syncSourceScroll = (event) => {
    if (!sourceHighlightRef.current) return
    sourceHighlightRef.current.scrollTop = event.currentTarget.scrollTop
    sourceHighlightRef.current.scrollLeft = event.currentTarget.scrollLeft
  }

  const formatSource = () => {
    try {
      const formatted = formatSvgMarkup(sourceDraft)
      commitDocument(formatted, { nextSelectedId: selectedId })
      setSourceDraft(formatted)
      setSourceDisplayMode('tree')
      showToast(copy.toastFormatted)
    } catch {
      showToast(copy.invalidSvg, 'error')
    }
  }

  const simplifySource = () => {
    try {
      const simplified = formatSvgMarkup(compactSvgTranslateTransforms(sourceDraft))
      commitDocument(simplified, { nextSelectedId: selectedId })
      setSourceDraft(simplified)
      setSourceDisplayMode('tree')
      showToast(copy.toastSimplified)
    } catch {
      showToast(copy.invalidSvg, 'error')
    }
  }

  const loadDemo = () => loadSvg(SAMPLE_SVG, 'demo.svg', { source: 'app-owned' })

  const hasDraggedFiles = (event) => Array.from(event.dataTransfer?.types || []).includes('Files')

  const handleFileDragEnter = (event) => {
    if (!hasDraggedFiles(event)) return
    event.preventDefault()
    fileDragCounterRef.current += 1
    setIsFileDragOver(true)
  }

  const handleFileDragOver = (event) => {
    event.preventDefault()
  }

  const handleFileDragLeave = (event) => {
    fileDragCounterRef.current = Math.max(0, fileDragCounterRef.current - 1)
    if (fileDragCounterRef.current === 0) setIsFileDragOver(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    fileDragCounterRef.current = 0
    setIsFileDragOver(false)
    handleFile(event.dataTransfer.files?.[0])
  }

  const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
  }

  const openExport = () => {
    const layerIds = getTopLevelSelectedIds(svgMarkup, selectedIds)
    const boxes = layerIds.map(getElementSvgBounds).filter(Boolean)
    setExportLayerIds(layerIds)
    setExportBounds(boxes.length ? {
      minX: Math.min(...boxes.map((box) => box.minX)), minY: Math.min(...boxes.map((box) => box.minY)),
      width: Math.max(...boxes.map((box) => box.maxX)) - Math.min(...boxes.map((box) => box.minX)),
      height: Math.max(...boxes.map((box) => box.maxY)) - Math.min(...boxes.map((box) => box.minY)),
    } : null)
    setExportSelectedOnly(layerIds.length > 0)
    setExportOpen(true)
  }

  const selectedExportMarkup = filterSvgToLayerIds(svgMarkup, exportLayerIds)
  const exportMarkup = exportSelectedOnly && exportLayerIds.length ? cropSvgToBounds(selectedExportMarkup, exportBounds) : svgMarkup
  const exportLayerCount = exportSelectedOnly && exportLayerIds.length ? exportLayerIds.length : elements.length
  const exportPreviewDimensions = useMemo(() => getSvgDimensions(new DOMParser().parseFromString(exportMarkup, 'image/svg+xml')), [exportMarkup])
  const exportPreviewWidth = Math.min(280, 170 * exportPreviewDimensions.width / exportPreviewDimensions.height)
  const exportPreviewStyle = { width: `${exportPreviewWidth}px`, height: `${exportPreviewWidth * exportPreviewDimensions.height / exportPreviewDimensions.width}px` }
  const exportPreviewExpandedScale = Math.min(640 / exportPreviewDimensions.width, 520 / exportPreviewDimensions.height)
  const exportPreviewExpandedStyle = { width: `${exportPreviewDimensions.width * exportPreviewExpandedScale}px`, height: `${exportPreviewDimensions.height * exportPreviewExpandedScale}px`, transform: `scale(${exportPreviewZoom})` }

  const closeExportPreview = () => {
    exportPreviewPointersRef.current.clear()
    exportPreviewPinchRef.current = null
    setExportPreviewOpen(false)
  }

  const openExportPreview = () => {
    exportPreviewZoomRef.current = 1
    setExportPreviewZoom(1)
    setExportPreviewOpen(true)
  }

  const updateExportPreviewPinch = () => {
    const pointers = [...exportPreviewPointersRef.current.values()]
    if (pointers.length !== 2 || !exportPreviewPinchRef.current) return
    const distance = Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y)
    const zoom = Math.min(3, Math.max(1, exportPreviewPinchRef.current.startZoom * distance / exportPreviewPinchRef.current.startDistance))
    exportPreviewZoomRef.current = zoom
    setExportPreviewZoom(zoom)
  }

  const handleExportPreviewPointerDown = (event) => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {}
    exportPreviewPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const pointers = [...exportPreviewPointersRef.current.values()]
    if (pointers.length === 2) exportPreviewPinchRef.current = { startDistance: Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y), startZoom: exportPreviewZoomRef.current }
  }

  const handleExportPreviewPointerMove = (event) => {
    if (!exportPreviewPointersRef.current.has(event.pointerId)) return
    exportPreviewPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    updateExportPreviewPinch()
  }

  const handleExportPreviewPointerEnd = (event) => {
    exportPreviewPointersRef.current.delete(event.pointerId)
    if (exportPreviewPointersRef.current.size < 2) exportPreviewPinchRef.current = null
  }

  useEffect(() => {
    if (!exportOpen) return undefined
    let cancelled = false
    const cleanMarkup = sanitizeForExport(exportMarkup)
    const dimensions = getSvgDimensions(new DOMParser().parseFromString(cleanMarkup, 'image/svg+xml'))
    const sizedMarkup = withExplicitSize(cleanMarkup, Math.round(dimensions.width), Math.round(dimensions.height))
    const svgMarkup = exportOptimize ? minifySvg(sizedMarkup) : sizedMarkup
    const svg = formatFileSize(new Blob([svgMarkup], { type: 'image/svg+xml' }).size)
    setExportSizes({ svg })

    const pixelWidth = Math.max(1, Math.round(dimensions.width * exportScale))
    const pixelHeight = Math.max(1, Math.round(dimensions.height * exportScale))
    const rasterMarkup = withExplicitSize(cleanMarkup, pixelWidth, pixelHeight)
    Promise.all([
      renderRasterExport(rasterMarkup, pixelWidth, pixelHeight, 'png'),
      renderRasterExport(rasterMarkup, pixelWidth, pixelHeight, 'webp'),
    ]).then(([png, webp]) => {
      if (!cancelled) setExportSizes({ svg, png: formatFileSize(png.size), webp: formatFileSize(webp.size) })
    }).catch(() => {
      if (!cancelled) setExportSizes({ svg })
    })

    return () => { cancelled = true }
  }, [exportOpen, exportMarkup, exportScale, exportOptimize])

  const exportSvg = () => {
    downloadBlob(new Blob([sanitizeForExport(svgMarkup)], { type: 'image/svg+xml' }), `${fileName.replace(/\.svg$/i, '')}-edited.svg`)
    setDirty(false)
    showToast(copy.toastExported)
  }

  const exportDocument = () => {
    const baseName = fileName.replace(/\.svg$/i, '') || 'untitled'
    const cleanMarkup = sanitizeForExport(exportMarkup)
    const dimensions = getSvgDimensions(new DOMParser().parseFromString(cleanMarkup, 'image/svg+xml'))
    if (exportFormat === 'svg') {
      // Bake the viewBox's intrinsic pixel size into width/height so the file
      // renders at the design dimensions anywhere it's opened. Without this,
      // a viewBox-only SVG falls back to the viewer's default 300×150 / 100%
      // sizing, which never matches what the canvas shows.
      const sizedMarkup = withExplicitSize(cleanMarkup, Math.round(dimensions.width), Math.round(dimensions.height))
      const output = exportOptimize ? minifySvg(sizedMarkup) : sizedMarkup
      downloadBlob(new Blob([output], { type: 'image/svg+xml' }), `${baseName}-edited.svg`)
      setDirty(false)
      setExportOpen(false)
      showToast(copy.toastExported)
      return
    }
    const pixelWidth = Math.max(1, Math.round(dimensions.width * exportScale))
    const pixelHeight = Math.max(1, Math.round(dimensions.height * exportScale))
    const sizedMarkup = withExplicitSize(cleanMarkup, pixelWidth, pixelHeight)
    renderRasterExport(sizedMarkup, pixelWidth, pixelHeight, exportFormat).then((blob) => {
      downloadBlob(blob, `${baseName}-${exportScale}x.${exportFormat}`)
      setDirty(false)
      setExportOpen(false)
      showToast(copy.toastExported)
    }).catch(() => showToast(copy.exportFailed, 'error'))
  }

  const alignSelection = (type) => {
    const topIds = getTopLevelSelectedIds(svgMarkup, selectedIds)
    const items = topIds.map((id) => ({ id, box: getElementSvgBounds(id) })).filter((item) => item.box)
    if (items.length < 2) return
    const isDistribute = type === 'distribute-x' || type === 'distribute-y'
    if (isDistribute && items.length < 3) return
    const minX = Math.min(...items.map((item) => item.box.minX))
    const maxX = Math.max(...items.map((item) => item.box.maxX))
    const minY = Math.min(...items.map((item) => item.box.minY))
    const maxY = Math.max(...items.map((item) => item.box.maxY))
    let moves = []
    if (type === 'left') moves = items.map((item) => ({ id: item.id, dx: minX - item.box.minX, dy: 0 }))
    else if (type === 'center-x') {
      const centerX = (minX + maxX) / 2
      moves = items.map((item) => ({ id: item.id, dx: centerX - item.box.cx, dy: 0 }))
    } else if (type === 'right') moves = items.map((item) => ({ id: item.id, dx: maxX - item.box.maxX, dy: 0 }))
    else if (type === 'top') moves = items.map((item) => ({ id: item.id, dx: 0, dy: minY - item.box.minY }))
    else if (type === 'center-y') {
      const centerY = (minY + maxY) / 2
      moves = items.map((item) => ({ id: item.id, dx: 0, dy: centerY - item.box.cy }))
    } else if (type === 'bottom') moves = items.map((item) => ({ id: item.id, dx: 0, dy: maxY - item.box.maxY }))
    else {
      const horizontal = type === 'distribute-x'
      const sorted = [...items].sort((a, b) => (horizontal ? a.box.cx - b.box.cx : a.box.cy - b.box.cy))
      const first = sorted[0]
      const last = sorted[sorted.length - 1]
      const span = horizontal ? last.box.cx - first.box.cx : last.box.cy - first.box.cy
      const step = span / (sorted.length - 1)
      moves = sorted.map((item, index) => {
        const target = (horizontal ? first.box.cx : first.box.cy) + step * index
        return horizontal
          ? { id: item.id, dx: target - item.box.cx, dy: 0 }
          : { id: item.id, dx: 0, dy: target - item.box.cy }
      })
    }
    const transaction = editSvgDocument(svgMarkup, { type: 'translate-by-id', moves, selectedId, selectedIds })
    if (transaction.changed) commitDocument(transaction.markup, { nextSelectedId: transaction.nextSelectedId, nextSelectedIds: transaction.nextSelectedIds })
  }

  const openContextMenu = (event, targetId) => {
    event.preventDefault()
    event.stopPropagation()
    if (targetId && !selectedIds.includes(targetId)) selectLayerIds([targetId], targetId)
    const menuWidth = 180
    const menuHeight = 254
    setContextMenu({
      x: Math.min(event.clientX, window.innerWidth - menuWidth - 8),
      y: Math.min(event.clientY, window.innerHeight - menuHeight - 8),
      targetId,
    })
  }

  const startRename = (targetId) => {
    const item = elements.find((element) => element.id === targetId)
    if (!item) return
    const displayName = getLayerDisplayName(item, language)
    renameInitialDraftRef.current = displayName
    setRenameDraft(displayName)
    setRenamingLayerId(targetId)
    setContextMenu(null)
  }

  const commitRename = () => {
    if (!renamingLayerId) return
    const targetId = renamingLayerId
    const trimmed = renameDraft.trim()
    const doc = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml')
    const node = doc.querySelector(`[data-editor-id="${targetId}"]`)
    setRenamingLayerId('')
    if (!node) return
    if (trimmed === renameInitialDraftRef.current) return
    const currentName = node.getAttribute('data-name') || ''
    if (trimmed === currentName) return
    if (trimmed) node.setAttribute('data-name', trimmed)
    else node.removeAttribute('data-name')
    commitDocument(new XMLSerializer().serializeToString(doc.documentElement), { nextSelectedId: targetId })
  }

  useEffect(() => {
    if (!contextMenu) return undefined
    const close = () => setContextMenu(null)
    window.addEventListener('pointerdown', close)
    window.addEventListener('blur', close)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('blur', close)
      window.removeEventListener('resize', close)
    }
  }, [contextMenu])

  useEffect(() => {
    if (!renamingLayerId) return
    renameInputRef.current?.focus()
    renameInputRef.current?.select()
  }, [renamingLayerId])

  const draftFill = attributeDrafts.targetId === selected?.id ? attributeDrafts.values.fill : undefined
  const fill = selected?.tag === 'text' && textGradient?.enabled
    ? draftFill ?? (selectedAttrs?.getAttribute('data-editor-solid-fill') || textGradient.startColor)
    : draftFill ?? getSelectedPaint('fill')
  const stroke = getDraftedAttribute('stroke', getSelectedPaint('stroke'))
  const opacity = Number(getDraftedAttribute('opacity', '1'))
  const strokeWidth = Number(getDraftedAttribute('stroke-width', '0'))
  const rectWidthValue = getDraftedAttribute('width', selectedAttrs?.getAttribute('width') || '200')
  const rectHeightValue = getDraftedAttribute('height', selectedAttrs?.getAttribute('height') || '200')
  const lineStartX = getDraftedAttribute('x1', selectedAttrs?.getAttribute('x1') || '0')
  const lineStartY = getDraftedAttribute('y1', selectedAttrs?.getAttribute('y1') || '0')
  const lineEndX = getDraftedAttribute('x2', selectedAttrs?.getAttribute('x2') || '0')
  const lineEndY = getDraftedAttribute('y2', selectedAttrs?.getAttribute('y2') || '0')
  const rectWidth = Number(rectWidthValue) || 200
  const rectHeight = Number(rectHeightValue) || 200
  const cornerRadiusMax = Math.max(1, Math.floor(Math.min(rectWidth, rectHeight) / 2))
  const cornerRadius = Math.min(cornerRadiusMax, Number(getDraftedAttribute('rx', '0')))
  const selectionPreviewBoxes = selectedIds.length > 1 ? [selectionBox, ...multiSelectionBoxes].filter(Boolean) : []
  const selectionGroupBox = selectionPreviewBoxes.length > 1 ? {
    left: Math.min(...selectionPreviewBoxes.map((box) => box.left)),
    top: Math.min(...selectionPreviewBoxes.map((box) => box.top)),
    right: Math.max(...selectionPreviewBoxes.map((box) => box.left + box.width)),
    bottom: Math.max(...selectionPreviewBoxes.map((box) => box.top + box.height)),
  } : null

  return (
    <main className="app-shell" onDragEnter={handleFileDragEnter} onDragOver={handleFileDragOver} onDragLeave={handleFileDragLeave} onDrop={handleDrop}>
      <header className="topbar">
        <div className="brand"><svg className="brand-mark" viewBox="0 0 1024 1024" aria-hidden="true"><defs><linearGradient id="vecsy-brand-orange" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FBA13A" /><stop offset="52%" stopColor="#F59836" /><stop offset="100%" stopColor="#F39230" /></linearGradient></defs><rect x="37" y="34" width="949" height="954" rx="160" fill="url(#vecsy-brand-orange)" /><path d="M210 254 H325 C333 254 340 258 344 266 L512 600 L681 266 C685 258 692 254 701 254 H816 C827 254 834 266 829 276 L541 838 C535 849 524 854 513 854 C501 854 490 849 484 838 L196 276 C191 266 199 254 210 254 Z" fill="#FFFFFF" /></svg><span>VECSY</span><a className="brand-github-link" href="https://github.com/wangruofeng/vecsy" target="_blank" rel="noreferrer" title={copy.githubRepository} aria-label={copy.githubRepository}><Icon name="github" size={17} /></a></div>
        <div className="topbar-actions">
          <span className="save-state"><span className={`status-dot ${dirty ? 'dirty' : ''}`} />{dirty ? copy.unsaved : copy.saved}</span>
          <button className="icon-button" title={`${copy.undo} (⌘Z)`} aria-keyshortcuts="Meta+Z" onClick={undo} disabled={!history.past.length}><Icon name="undo" /></button>
          <button className="icon-button" title={`${copy.redo} (⌘⇧Z)`} aria-keyshortcuts="Meta+Shift+Z" onClick={redo} disabled={!history.future.length}><Icon name="redo" /></button>
          <button className="icon-button" type="button" title={`${copy.shortcutsTitle} (?)`} aria-label={copy.shortcutsTitle} aria-pressed={showShortcuts} onClick={() => setShowShortcuts((current) => !current)}><Icon name="help" /></button>
          <button className="icon-button recent-svg-button" type="button" title={copy.recentSvgs} aria-label={copy.recentSvgs} aria-pressed={showRecentSvgs} onClick={() => setShowRecentSvgs(true)}><Icon name="history" /></button>
          <span className="divider" />
          <div className="language-menu-wrap">
            <button className="language-toggle" type="button" onClick={() => setLangMenuOpen((current) => !current)} aria-label={copy.languageSwitch} aria-haspopup="menu" aria-expanded={langMenuOpen} title={copy.languageSwitch}><Icon name="globe" size={13} /></button>
            {langMenuOpen && <div className="language-menu" role="menu" aria-label={copy.languageSwitch}>{LANGUAGES.map((item) => <button key={item.code} type="button" role="menuitemradio" aria-checked={language === item.code} className={language === item.code ? 'is-active' : ''} onClick={() => { setLanguage(item.code); setLangMenuOpen(false) }}><span className="language-menu-check">{language === item.code && <Icon name="check" size={12} />}</span><span>{item.label}</span></button>)}</div>}
          </div>
          <button className="button button-quiet" onClick={() => fileInput.current?.click()}><Icon name="download" /> {copy.open}</button>
          <button className="button button-accent" onClick={openExport}><Icon name="upload" /> {copy.export}</button>
          <input ref={fileInput} type="file" accept="image/svg+xml,.svg" hidden onChange={(event) => handleFile(event.target.files?.[0])} />
          <input ref={imageInput} type="file" accept="image/*" hidden onChange={(event) => { addImageLayer(event.target.files?.[0]); event.target.value = '' }} />
        </div>
      </header>

      <section className={`workspace ${isLayersOpen ? '' : 'layers-collapsed'} ${isInspectorOpen ? '' : 'inspector-collapsed'}`}>
        <LayerPanel
          copy={copy}
          language={language}
          isLayersOpen={isLayersOpen}
          setIsLayersOpen={setIsLayersOpen}
          addLayerMenuOpen={addLayerMenuOpen}
          setAddLayerMenuOpen={setAddLayerMenuOpen}
          openImagePicker={openImagePicker}
          openSvgCollection={openSvgCollection}
          visibleLayerItems={visibleLayerItems}
          selectedId={selectedId}
          selectedIds={selectedIds}
          selectLayerIds={selectLayerIds}
          layerRowRefs={layerRowRefs}
          draggingLayerId={draggingLayerId}
          dragOverLayerId={dragOverLayerId}
          suppressLayerClickRef={suppressLayerClickRef}
          handleLayerMouseDown={handleLayerMouseDown}
          openContextMenu={openContextMenu}
          startRename={startRename}
          toggleGroup={toggleGroup}
          expandedGroups={expandedGroups}
          renamingLayerId={renamingLayerId}
          renameInputRef={renameInputRef}
          renameDraft={renameDraft}
          setRenameDraft={setRenameDraft}
          commitRename={commitRename}
          toggleVisibility={toggleVisibility}
          addLayer={addLayer}
        />
        <CanvasPanel
          copy={copy}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          formatSource={formatSource}
          simplifySource={simplifySource}
          sourceDisplayMode={sourceDisplayMode}
          setSourceDisplayMode={setSourceDisplayMode}
          expandedGroups={expandedGroups}
          toggleGroup={toggleGroup}
          selectedIds={selectedIds}
          selectLayerIds={selectLayerIds}
          alignSelection={alignSelection}
          zoomBy={zoomBy}
          fitToScreen={fitToScreen}
          svgScale={svgScale}
          setSvgScale={setSvgScale}
          setSvgPosition={setSvgPosition}
          canvasRef={canvasRef}
          handleCanvasClick={handleCanvasClick}
          handleSvgDoubleClick={handleSvgDoubleClick}
          openContextMenu={openContextMenu}
          handleCanvasPointerDown={handleCanvasPointerDown}
          handleCanvasPointerMove={handleCanvasPointerMove}
          handleCanvasPointerUp={handleCanvasPointerUp}
          hoveredLayerId={hoveredLayerId}
          setHoveredLayerId={setHoveredLayerId}
          elements={elements}
          isDraggingSvg={isDraggingSvg}
          isDraggingElement={isDraggingElement}
          isPinchingSvg={isPinchingSvg}
          svgRef={svgRef}
          svgPosition={svgPosition}
          renderedMarkup={renderedMarkup}
          editingTextId={editingTextId}
          selectedId={selectedId}
          selected={selected}
          selectionBox={selectionBox}
          lineEndpoints={lineEndpoints}
          textDraft={textDraft}
          setTextDraft={setTextDraft}
          commitTextEdit={commitTextEdit}
          cancelTextEdit={cancelTextEdit}
          language={language}
          selectionGroupBox={selectionGroupBox}
          multiSelectionBoxes={multiSelectionBoxes}
          isResizingElement={isResizingElement}
          handleResizePointerMove={handleResizePointerMove}
          handleResizePointerUp={handleResizePointerUp}
          handleResizePointerDown={handleResizePointerDown}
          sourceHighlightRef={sourceHighlightRef}
          highlightedSource={highlightedSource}
          sourceDraft={sourceDraft}
          setSourceDraft={setSourceDraft}
          syncSourceScroll={syncSourceScroll}
          commitSourceMarkup={commitSourceMarkup}
          showToast={showToast}
          loadDemo={loadDemo}
          toast={toast}
          toastTimerRef={toastTimerRef}
          selectedDisplayName={selectedDisplayName}
          setToast={setToast}
        />
        <InspectorPanel
          copy={copy}
          language={language}
          isInspectorOpen={isInspectorOpen}
          setIsInspectorOpen={setIsInspectorOpen}
          selected={selected}
          selectedDisplayName={selectedDisplayName}
          isSelectedHidden={isSelectedHidden}
          textFieldDraft={textFieldDraft}
          setTextFieldDraft={setTextFieldDraft}
          commitTextField={commitTextField}
          startTextEdit={startTextEditFromInspector}
          textFontSize={textFontSize}
          textLetterSpacing={textLetterSpacing}
          textFontFamily={textFontFamily}
          isTextBold={isTextBold}
          previewAttributeDebounced={previewAttributeDebounced}
          commitPreviewAttributes={commitPreviewAttributes}
          previewTextGradientDebounced={previewTextGradientDebounced}
          commitTextGradient={commitTextGradient}
          textGradient={textGradient}
          handleTextAttributeKeyDown={handleTextAttributeKeyDown}
          rectWidthValue={rectWidthValue}
          rectHeightValue={rectHeightValue}
          lineStartX={lineStartX}
          lineStartY={lineStartY}
          lineEndX={lineEndX}
          lineEndY={lineEndY}
          updateRectAspectRatio={updateRectAspectRatio}
          polygonSides={polygonSides}
          updatePolygonSides={updatePolygonSides}
          fill={fill}
          stroke={stroke}
          opacity={opacity}
          strokeWidth={strokeWidth}
          cornerRadiusMax={cornerRadiusMax}
          cornerRadius={cornerRadius}
          previewRectRadius={previewRectRadius}
          elements={elements}
          colorTokens={colorTokens}
          previewColorTokenDebounced={previewColorTokenDebounced}
          commitColorToken={commitColorToken}
          fileName={fileName}
          renameDocument={renameDocument}
        />
      </section>

      {showShortcuts && <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
        <div className="shortcuts-modal" role="dialog" aria-modal="true" aria-label={copy.shortcutsTitle} onClick={(event) => event.stopPropagation()}>
          <div className="shortcuts-header"><span>{copy.shortcutsTitle}</span><button className="mini-button" type="button" title={copy.close} aria-label={copy.close} onClick={() => setShowShortcuts(false)}><Icon name="x" size={14} /></button></div>
          <div className="shortcuts-grid">
            {shortcutGroups.map((group) => <div className={`shortcuts-group ${group.wide ? 'shortcuts-group-wide' : ''}`} key={group.title}>
              <div className="section-label">{group.title}</div>
              {group.items.map(([keys, label]) => <div className="shortcut-row" key={label}><span className="kbd">{keys}</span><span className="shortcut-label">{label}</span></div>)}
            </div>)}
          </div>
          <p className="shortcuts-hint">{copy.shortcutsHint}</p>
        </div>
      </div>}
      {showSvgCollection && <SvgCollectionModal copy={copy} onClose={() => setShowSvgCollection(false)} onSelect={addSvgCollectionItem} processCustomSvg={processSvgInput} showSecurityFeedback={showSecurityFeedback} />}
      {showRecentSvgs && <RecentSvgModal copy={copy} documents={recentDocuments} onClose={() => setShowRecentSvgs(false)} onOpen={openRecentDocument} onRemove={removeRecentDocument} />}
      {exportOpen && <div className="shortcuts-overlay" onClick={() => setExportOpen(false)}>
        <div className="shortcuts-modal export-modal" role="dialog" aria-modal="true" aria-label={copy.exportDialogTitle} onClick={(event) => event.stopPropagation()}>
          <div className="shortcuts-header"><span>{copy.exportDialogTitle}</span><button className="mini-button" type="button" title={copy.close} aria-label={copy.close} onClick={() => setExportOpen(false)}><Icon name="x" size={14} /></button></div>
          <div className="export-body">
            <div className="export-row">
              <span className="export-label">{copy.exportScope}</span>
              <div className="view-tabs" role="radiogroup" aria-label={copy.exportScope}>
                <button type="button" role="radio" aria-checked={!exportSelectedOnly} className={!exportSelectedOnly ? 'active' : ''} onClick={() => setExportSelectedOnly(false)}>{copy.exportAllLayers}</button>
                <button type="button" role="radio" aria-checked={exportSelectedOnly} className={exportSelectedOnly ? 'active' : ''} disabled={!exportLayerIds.length} onClick={() => setExportSelectedOnly(true)}>{copy.exportSelectedLayers}</button>
              </div>
            </div>
            <div className="export-row"><span className="export-label">{copy.exportFormat}</span><div className="view-tabs"><button type="button" className={exportFormat === 'svg' ? 'active' : ''} onClick={() => setExportFormat('svg')}>SVG</button><button type="button" className={exportFormat === 'png' ? 'active' : ''} onClick={() => setExportFormat('png')}>PNG</button><button type="button" className={exportFormat === 'webp' ? 'active' : ''} onClick={() => setExportFormat('webp')}>WebP</button></div></div>
            {exportFormat !== 'svg' && <>
              <div className="export-row"><span className="export-label">{copy.exportScale}</span><div className="view-tabs">{[1, 2, 3].map((scale) => <button key={scale} type="button" className={exportScale === scale ? 'active' : ''} onClick={() => setExportScale(scale)}>{scale}x</button>)}</div></div>
            </>}
            <div className="export-row"><span className="export-label">{copy.exportLayerCount}</span><span className="export-layer-count" aria-live="polite">{exportLayerCount}</span></div>
            {exportFormat === 'svg' && <div className="export-row"><span className="export-label">{copy.exportOptimize}</span><label className="export-check"><input type="checkbox" checked={exportOptimize} onChange={(event) => setExportOptimize(event.target.checked)} /><span className="export-check-switch" /></label></div>}
            <div className="export-size" aria-live="polite"><span className="export-label">{copy.exportEstimatedSize}</span><div className="export-size-values"><span>SVG {exportSizes?.svg || '-'}</span><span>PNG {exportSizes?.png || '-'}</span><span>WebP {exportSizes?.webp || '-'}</span></div></div>
            <div className="export-preview"><span className="export-label">{copy.exportPreview}</span><button className="export-preview-canvas" type="button" style={exportPreviewStyle} onClick={openExportPreview} aria-label={copy.expandExportPreview} title={copy.expandExportPreview} dangerouslySetInnerHTML={{ __html: exportMarkup }} /></div>
          </div>
          <div className="export-footer"><button className="button button-accent" type="button" onClick={exportDocument}><Icon name="upload" /> {copy.exportShort}</button></div>
        </div>
      </div>}
      {exportPreviewOpen && <div className="shortcuts-overlay export-preview-overlay" onClick={closeExportPreview}>
        <div className="export-preview-dialog" role="dialog" aria-modal="true" aria-label={copy.expandExportPreview} onClick={(event) => event.stopPropagation()}>
          <button className="mini-button export-preview-close" type="button" title={copy.close} aria-label={copy.close} onClick={closeExportPreview}><Icon name="x" size={14} /></button>
          <div className="export-preview-zoom-stage" onPointerDown={handleExportPreviewPointerDown} onPointerMove={handleExportPreviewPointerMove} onPointerUp={handleExportPreviewPointerEnd} onPointerCancel={handleExportPreviewPointerEnd}><div className="export-preview-zoom-canvas" style={exportPreviewExpandedStyle} dangerouslySetInnerHTML={{ __html: exportMarkup }} /></div>
        </div>
      </div>}
      {contextMenu && contextMenuTarget && <div className="context-menu" role="menu" style={{ left: contextMenu.x, top: contextMenu.y }} onPointerDown={(event) => event.stopPropagation()}>
        <button type="button" role="menuitem" onClick={() => startRename(contextMenu.targetId)}><Icon name="edit" size={13} /><span>{copy.menuRename}</span></button>
        <button type="button" role="menuitem" onClick={() => { copySelectedLayer(); setContextMenu(null) }}><Icon name="copy" size={13} /><span>{copy.shortcutCopy}</span></button>
        <button type="button" role="menuitem" disabled={selectedIds.length < 2} onClick={() => { groupSelectedLayers(); setContextMenu(null) }}><Icon name="layers" size={13} /><span>{copy.menuGroup}</span></button>
        <button type="button" role="menuitem" disabled={!clipboardLayerRef.current} onClick={() => { pasteLayer(); setContextMenu(null) }}><Icon name="paste" size={13} /><span>{copy.shortcutPaste}</span></button>
        <button type="button" role="menuitem" onClick={(event) => { toggleVisibility(contextMenuTarget, event); setContextMenu(null) }}><Icon name="eye" size={13} /><span>{isElementHidden(contextMenuTarget.node) ? copy.show : copy.hide}</span></button>
        <span className="menu-divider" />
        <button type="button" role="menuitem" className="menu-danger" onClick={() => { deleteSelectedLayer(); setContextMenu(null) }}><Icon name="trash" size={13} /><span>{copy.shortcutDelete}</span></button>
      </div>}
      {isFileDragOver && <div className="drop-overlay" aria-hidden="true"><div className="drop-overlay-card"><Icon name="upload" size={30} /><span>{copy.dropOverlayTitle}</span></div></div>}
    </main>
  )
}

registerRuntimeIdentity()
createRoot(document.getElementById('root')).render(<App />)
