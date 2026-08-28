import { useEffect, useMemo, useRef, useState } from 'react'
import { LANGUAGES } from '../app/copy.js'
import { parseSvg } from '../editor/svg-parser.js'
import { processSvgInput } from '../editor/process-svg-input.js'
import { deleteDocument, listRecentDocuments, openDocumentDatabase, readDocument, readMeta, saveCurrentDocument, saveRecentDocuments } from '../storage/document-db.js'

export default function useEditorDocument({ initialMarkup, storageKey, legacyStorageKey, historyLimit = 50 }) {
  const recentStorageKey = `${storageKey}:recent-documents`
  const legacyRecentStorageKey = legacyStorageKey ? `${legacyStorageKey}:recent-documents` : null
  const initial = useMemo(() => parseSvg(initialMarkup), [initialMarkup])
  const [persisted] = useState(() => {
    try {
      const stored = window.localStorage.getItem(storageKey) || (legacyStorageKey ? window.localStorage.getItem(legacyStorageKey) : null)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const persistedDocument = useMemo(() => {
    if (!persisted?.svgMarkup) return initial
    try {
      return parseSvg(persisted.svgMarkup)
    } catch {
      return initial
    }
  }, [initial, persisted])
  const [language, setLanguage] = useState(() => {
    const stored = persisted?.language === 'zh' ? 'zh-CN' : persisted?.language
    return LANGUAGES.some((item) => item.code === stored) ? stored : 'en'
  })
  const [svgMarkup, setSvgMarkup] = useState(persistedDocument.markup)
  const [sourceDraft, setSourceDraft] = useState(persistedDocument.markup)
  const [elements, setElements] = useState(persistedDocument.elements)
  const [selectedId, setSelectedId] = useState(persisted?.selectedId || persistedDocument.elements[0]?.id || '')
  const [selectedIds, setSelectedIds] = useState(() => {
    const persistedIds = Array.isArray(persisted?.selectedIds) ? persisted.selectedIds : []
    const validIds = persistedIds.filter((id) => persistedDocument.elements.some((item) => item.id === id))
    const fallbackId = persisted?.selectedId || persistedDocument.elements[0]?.id || ''
    return validIds.length ? validIds : (fallbackId ? [fallbackId] : [])
  })
  const [fileName, setFileName] = useState(persisted?.fileName || 'untitled.svg')
  const [recentDocuments, setRecentDocuments] = useState(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(recentStorageKey) || (legacyRecentStorageKey ? window.localStorage.getItem(legacyRecentStorageKey) : null) || '[]')
      return Array.isArray(stored)
        ? stored.filter((item) => {
          if (!item?.fileName || !item?.svgMarkup) return false
          try {
            return parseSvg(item.svgMarkup).hasContent
          } catch {
            return false
          }
        }).slice(0, 20)
        : []
    } catch {
      return []
    }
  })
  const [dirty, setDirty] = useState(Boolean(persisted?.dirty))
  const [history, setHistory] = useState(() => ({
    past: Array.isArray(persisted?.history?.past) ? persisted.history.past : [],
    future: Array.isArray(persisted?.history?.future) ? persisted.history.future : [],
  }))
  const [storageError, setStorageError] = useState(false)
  const storageWarnedRef = useRef(false)
  const databaseRef = useRef(null)
  const saveChainRef = useRef(Promise.resolve())
  const saveRevisionRef = useRef(0)
  const [databaseReady, setDatabaseReady] = useState(false)

  useEffect(() => {
    let closed = false
    openDocumentDatabase().then(async (database) => {
      if (closed) return database.close()
      databaseRef.current = database
      let [storedDocument, storedLanguage, storedRecents] = await Promise.all([readDocument(database, 'current'), readMeta(database, 'language'), listRecentDocuments(database)])
      if (!storedDocument && persisted?.svgMarkup) {
        const migrated = processSvgInput(persisted.svgMarkup)
        if (migrated.status !== 'rejected') {
          await saveCurrentDocument(database, {
            id: 'current', fileName: persisted.fileName || 'untitled.svg', svgMarkup: migrated.markup,
            selectedId: persisted.selectedId || '', selectedIds: Array.isArray(persisted.selectedIds) ? persisted.selectedIds : [],
            dirty: Boolean(persisted.dirty), revision: 1, createdAt: Date.now(), updatedAt: Date.now(),
          }, { lastDocumentId: 'current', language: language, migrationState: 'idb-primary' })
          storedDocument = await readDocument(database, 'current')
          storedRecents = await listRecentDocuments(database)
        }
      }
      if (!storedRecents.length && recentDocuments.length) {
        await saveRecentDocuments(database, recentDocuments)
        storedRecents = await listRecentDocuments(database)
      }
      if (!closed && storedDocument?.svgMarkup) {
        const restored = processSvgInput(storedDocument.svgMarkup)
        if (restored.status === 'rejected') throw new Error('Stored document is invalid')
        const parsed = parseSvg(restored.markup)
        setSvgMarkup(parsed.markup)
        setSourceDraft(parsed.markup)
        setElements(parsed.elements)
        setSelectedId(storedDocument.selectedId || parsed.elements[0]?.id || '')
        setSelectedIds(Array.isArray(storedDocument.selectedIds) ? storedDocument.selectedIds : [])
        setFileName(storedDocument.fileName || 'untitled.svg')
        setDirty(Boolean(storedDocument.dirty))
        if (LANGUAGES.some((item) => item.code === storedLanguage?.value)) setLanguage(storedLanguage.value)
      }
      if (!closed && storedRecents.length) setRecentDocuments(storedRecents.map(({ fileName, svgMarkup, updatedAt }) => ({ fileName, svgMarkup, updatedAt })))
      setDatabaseReady(true)
    }).catch(() => setStorageError(true))
    return () => { closed = true; databaseRef.current?.close(); databaseRef.current = null }
  }, [])

  useEffect(() => {
    if (!databaseReady || !databaseRef.current) return undefined
    const revision = ++saveRevisionRef.current
    const save = () => {
      saveChainRef.current = saveChainRef.current.then(() => {
        if (revision !== saveRevisionRef.current || !databaseRef.current) return
        return saveCurrentDocument(databaseRef.current, {
          id: 'current', fileName, svgMarkup, selectedId, selectedIds, dirty, revision, updatedAt: Date.now(),
        }, { lastDocumentId: 'current', language })
      }).catch(() => setStorageError(true))
    }
    const timeout = window.setTimeout(save, 750)
    const flushWhenHidden = () => {
      if (document.visibilityState !== 'hidden') return
      window.clearTimeout(timeout)
      save()
    }
    document.addEventListener('visibilitychange', flushWhenHidden)
    return () => { window.clearTimeout(timeout); document.removeEventListener('visibilitychange', flushWhenHidden) }
  }, [databaseReady, svgMarkup, fileName, selectedId, selectedIds, dirty, language])

  useEffect(() => {
    if (!databaseReady || !databaseRef.current) return undefined
    const timeout = window.setTimeout(() => {
      saveChainRef.current = saveChainRef.current.then(() => databaseRef.current && saveRecentDocuments(databaseRef.current, recentDocuments)).catch(() => setStorageError(true))
    }, 750)
    return () => window.clearTimeout(timeout)
  }, [databaseReady, recentDocuments])

  useEffect(() => {
    if (databaseReady) return undefined
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({
          svgMarkup, fileName, selectedId, selectedIds, dirty, history, language,
        }))
      } catch {
        if (!storageWarnedRef.current) {
          storageWarnedRef.current = true
          setStorageError(true)
        }
      }
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [databaseReady, storageKey, svgMarkup, fileName, selectedId, selectedIds, dirty, history, language])

  useEffect(() => {
    if (databaseReady) return undefined
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(recentStorageKey, JSON.stringify(recentDocuments))
      } catch {
        if (!storageWarnedRef.current) {
          storageWarnedRef.current = true
          setStorageError(true)
        }
      }
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [databaseReady, recentDocuments, recentStorageKey])

  const recordRecentDocument = (document, name) => {
    if (!document.hasContent) return
    setRecentDocuments((current) => [
      { fileName: name, svgMarkup: document.markup, updatedAt: Date.now() },
      ...current.filter((item) => item.fileName !== name),
    ].slice(0, 20))
  }

  const removeRecentDocument = (fileName) => {
    setRecentDocuments((current) => current.filter((item) => item.fileName !== fileName))
    if (databaseReady && databaseRef.current) {
      saveChainRef.current = saveChainRef.current.then(() => databaseRef.current && deleteDocument(databaseRef.current, `recent:${fileName}`)).catch(() => setStorageError(true))
    }
  }

  const selectLayerIds = (nextIds, primaryId = nextIds[nextIds.length - 1] || '') => {
    const validIds = [...new Set(nextIds)].filter((id) => elements.some((item) => item.id === id))
    setSelectedIds(validIds)
    setSelectedId(validIds.includes(primaryId) ? primaryId : validIds[validIds.length - 1] || '')
  }

  const currentSnapshot = () => ({ svgMarkup, fileName, selectedId, dirty })

  const commitDocument = (rawMarkup, { nextSelectedId = selectedId, nextSelectedIds, nextFileName = fileName, nextDirty = true, historySnapshot = currentSnapshot(), forceHistory = false } = {}) => {
    const parsed = parseSvg(rawMarkup)
    if (!forceHistory && parsed.markup === svgMarkup && nextFileName === fileName && nextDirty === dirty) {
      setSourceDraft(parsed.markup)
      return
    }
    const validSelectedId = parsed.elements.some((item) => item.id === nextSelectedId) ? nextSelectedId : parsed.elements[0]?.id || ''
    const validSelectedIds = (nextSelectedIds || [validSelectedId]).filter((id) => parsed.elements.some((item) => item.id === id))
    setHistory((current) => ({ past: [...current.past, historySnapshot].slice(-historyLimit), future: [] }))
    setSvgMarkup(parsed.markup)
    setSourceDraft(parsed.markup)
    setElements(parsed.elements)
    setSelectedId(validSelectedId)
    setSelectedIds(validSelectedIds.length ? validSelectedIds : (validSelectedId ? [validSelectedId] : []))
    setFileName(nextFileName)
    setDirty(nextDirty)
    recordRecentDocument(parsed, nextFileName)
  }

  const restoreSnapshot = (snapshot) => {
    const parsed = parseSvg(snapshot.svgMarkup)
    const validSelectedId = parsed.elements.some((item) => item.id === snapshot.selectedId) ? snapshot.selectedId : parsed.elements[0]?.id || ''
    setSvgMarkup(parsed.markup)
    setSourceDraft(parsed.markup)
    setElements(parsed.elements)
    setSelectedId(validSelectedId)
    setSelectedIds(validSelectedId ? [validSelectedId] : [])
    setFileName(snapshot.fileName)
    setDirty(snapshot.dirty)
    recordRecentDocument(parsed, snapshot.fileName)
  }

  const undo = () => {
    if (!history.past.length) return
    const previous = history.past[history.past.length - 1]
    setHistory({ past: history.past.slice(0, -1), future: [currentSnapshot(), ...history.future].slice(0, historyLimit) })
    restoreSnapshot(previous)
  }

  const redo = () => {
    if (!history.future.length) return
    const next = history.future[0]
    setHistory({ past: [...history.past, currentSnapshot()].slice(-historyLimit), future: history.future.slice(1) })
    restoreSnapshot(next)
  }

  const loadDocument = (rawMarkup, nextFileName = 'untitled.svg') => {
    const parsed = parseSvg(rawMarkup)
    setSvgMarkup(parsed.markup)
    setSourceDraft(parsed.markup)
    setElements(parsed.elements)
    setSelectedId(parsed.elements[0]?.id || '')
    setSelectedIds(parsed.elements[0]?.id ? [parsed.elements[0].id] : [])
    setFileName(nextFileName)
    setDirty(false)
    setHistory({ past: [], future: [] })
    recordRecentDocument(parsed, nextFileName)
    return parsed
  }

  return {
    language, setLanguage,
    svgMarkup, setSvgMarkup,
    sourceDraft, setSourceDraft,
    elements, setElements,
    selectedId, setSelectedId,
    selectedIds, setSelectedIds,
    fileName, setFileName,
    recentDocuments,
    dirty, setDirty,
    history, setHistory,
    storageError, setStorageError,
    selectLayerIds, currentSnapshot, commitDocument, restoreSnapshot, undo, redo, loadDocument, removeRecentDocument,
  }
}
