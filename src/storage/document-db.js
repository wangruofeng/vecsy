const DB_NAME = 'vecsy'
const DB_VERSION = 1

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'))
  })
}

function transactionResult(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'))
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed'))
  })
}

export function openDocumentDatabase({ name = DB_NAME } = {}) {
  if (!globalThis.indexedDB) return Promise.reject(new Error('IndexedDB is unavailable'))
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('documents')) db.createObjectStore('documents', { keyPath: 'id' }).createIndex('updatedAt', 'updatedAt')
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' })
    }
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close()
      resolve(request.result)
    }
    request.onblocked = () => reject(new Error('IndexedDB upgrade is blocked by another tab'))
    request.onerror = () => reject(request.error || new Error('Could not open IndexedDB'))
  })
}

export async function readDocument(db, id) {
  return requestResult(db.transaction('documents').objectStore('documents').get(id))
}

export async function writeDocument(db, document) {
  const transaction = db.transaction('documents', 'readwrite')
  transaction.objectStore('documents').put(document)
  await transactionResult(transaction)
  return document
}

export async function readMeta(db, key) {
  return requestResult(db.transaction('meta').objectStore('meta').get(key))
}

export async function writeMeta(db, key, value) {
  const transaction = db.transaction('meta', 'readwrite')
  transaction.objectStore('meta').put({ key, value })
  await transactionResult(transaction)
}

export async function saveCurrentDocument(db, document, meta) {
  const transaction = db.transaction(['documents', 'meta'], 'readwrite')
  transaction.objectStore('documents').put(document)
  Object.entries(meta).forEach(([key, value]) => transaction.objectStore('meta').put({ key, value }))
  await transactionResult(transaction)
}

export async function listRecentDocuments(db) {
  const documents = await requestResult(db.transaction('documents').objectStore('documents').getAll())
  return documents.filter((document) => document.kind === 'recent').sort((left, right) => right.updatedAt - left.updatedAt)
}

export async function saveRecentDocuments(db, documents) {
  const transaction = db.transaction('documents', 'readwrite')
  const store = transaction.objectStore('documents')
  documents.forEach((document) => store.put({ ...document, id: `recent:${document.fileName}`, kind: 'recent' }))
  await transactionResult(transaction)
}

export async function deleteDocument(db, id) {
  const transaction = db.transaction('documents', 'readwrite')
  transaction.objectStore('documents').delete(id)
  await transactionResult(transaction)
}
