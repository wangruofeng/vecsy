import { afterEach, describe, expect, it } from 'vitest'
import { deleteDocument, openDocumentDatabase, readDocument, readMeta, writeDocument, writeMeta } from '../../src/storage/document-db.js'

const names = []
afterEach(async () => Promise.all(names.splice(0).map((name) => new Promise((resolve) => { const request = indexedDB.deleteDatabase(name); request.onsuccess = request.onerror = request.onblocked = () => resolve() }))))

describe('document database', () => {
  it('rejects explicitly when IndexedDB is unavailable', async () => {
    const original = globalThis.indexedDB
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: undefined })
    await expect(openDocumentDatabase()).rejects.toThrow('unavailable')
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: original })
  })

  it('persists documents and metadata after transaction completion', async () => {
    const name = `vecsy-test-${Date.now()}`
    names.push(name)
    const db = await openDocumentDatabase({ name })
    await writeDocument(db, { id: 'current', svgMarkup: '<svg/>', revision: 1, updatedAt: 1 })
    await writeMeta(db, 'lastDocumentId', 'current')

    await expect(readDocument(db, 'current')).resolves.toMatchObject({ revision: 1 })
    await expect(readMeta(db, 'lastDocumentId')).resolves.toMatchObject({ value: 'current' })
    await deleteDocument(db, 'current')
    await expect(readDocument(db, 'current')).resolves.toBeUndefined()
    db.close()
  })
})
