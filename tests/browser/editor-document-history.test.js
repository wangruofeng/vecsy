import { act } from 'react'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import useEditorDocument from '../../src/hooks/useEditorDocument.js'
import { openDocumentDatabase, writeDocument } from '../../src/storage/document-db.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const OLD_DOC = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect id="a" x="10" y="10" width="40" height="40" fill="red"/></svg>'
const DB_DOC = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><circle id="a" cx="60" cy="60" r="30" fill="blue"/></svg>'
// 旧会话删空图层后留在历史里的空 svg 快照
const EMPTY_SNAPSHOT = { svgMarkup: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"></svg>', fileName: 'old.svg', selectedId: '', selectedIds: [], dirty: true }

const deleteVecsyDatabase = () => new Promise((resolve) => {
  const request = indexedDB.deleteDatabase('vecsy')
  request.onsuccess = request.onerror = request.onblocked = () => resolve()
})

const settle = (ms) => act(async () => { await new Promise((resolve) => setTimeout(resolve, ms)) })

describe('useEditorDocument history hydration', () => {
  let container
  let unmounters
  let latest

  const waitFor = async (predicate, timeout = 2000) => {
    const deadline = performance.now() + timeout
    while (!predicate()) {
      if (performance.now() > deadline) throw new Error(`timed out waiting for editor state: ${JSON.stringify({ storageError: latest?.storageError, fileName: latest?.fileName, markup: latest?.svgMarkup?.slice(0, 60) })}`)
      await settle(25)
    }
  }

  beforeEach(() => {
    localStorage.clear()
    latest = null
    unmounters = []
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(async () => {
    await act(async () => { unmounters.forEach((unmount) => unmount()) })
    container.remove()
    localStorage.clear()
    await deleteVecsyDatabase()
  })

  const mountEditor = (props) => {
    const Probe = () => {
      latest = useEditorDocument(props)
      return null
    }
    let root
    act(() => {
      root = createRoot(container)
      root.render(createElement(Probe))
    })
    const unmount = () => root.unmount()
    unmounters.push(unmount)
    return unmount
  }

  const seedLocalStorage = (history) => {
    localStorage.setItem('vecsy-history-test', JSON.stringify({
      svgMarkup: OLD_DOC, fileName: 'old.svg', selectedId: 'node-0', selectedIds: ['node-0'], dirty: true, history, language: 'en',
    }))
  }

  it('clears stale localStorage history when the document is restored from IndexedDB', async () => {
    seedLocalStorage({ past: [EMPTY_SNAPSHOT, EMPTY_SNAPSHOT], future: [EMPTY_SNAPSHOT] })
    const db = await openDocumentDatabase({ name: 'vecsy' })
    await writeDocument(db, { id: 'current', fileName: 'new.svg', svgMarkup: DB_DOC, selectedId: 'node-0', selectedIds: ['node-0'], dirty: false, revision: 1, updatedAt: Date.now() })
    db.close()

    mountEditor({ storageKey: 'vecsy-history-test', initialMarkup: OLD_DOC })
    await waitFor(() => latest?.fileName === 'new.svg' && latest.svgMarkup.includes('blue'))
    expect(latest.fileName).toBe('new.svg')
    expect(latest.svgMarkup).toContain('blue')
    // 恢复出的文档与 localStorage 残留历史不同源，撤销栈必须从零开始
    expect(latest.history.past).toEqual([])
    expect(latest.history.future).toEqual([])
    act(() => latest.undo())
    await settle(0)
    expect(latest.svgMarkup).toContain('blue')
  })

  it('keeps localStorage history when IndexedDB is unavailable', async () => {
    seedLocalStorage({ past: [EMPTY_SNAPSHOT], future: [] })
    const original = globalThis.indexedDB
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: undefined })
    try {
      mountEditor({ storageKey: 'vecsy-history-test', initialMarkup: OLD_DOC })
      await waitFor(() => latest?.storageError === true)
      expect(latest.fileName).toBe('old.svg')
      expect(latest.history.past).toHaveLength(1)
      act(() => latest.undo())
      await waitFor(() => latest.elements.length === 0)
    } finally {
      Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: original })
    }
  })
})
