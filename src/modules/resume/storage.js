import {
  RESUME_DB_NAME,
  RESUME_DB_VERSION,
  RESUME_DRAFT_KEY,
  RESUME_DRAFT_STORE,
  RESUME_WORKSPACE_STORE,
  STORAGE_KEY,
  WORKSPACE_HANDLE_KEY,
} from './constants'

function hasIndexedDb() {
  return typeof indexedDB !== 'undefined'
}

function openRequest() {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error('INDEXED_DB_UNAVAILABLE'))
      return
    }

    const request = indexedDB.open(RESUME_DB_NAME, RESUME_DB_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(RESUME_DRAFT_STORE)) {
        database.createObjectStore(RESUME_DRAFT_STORE)
      }
      if (!database.objectStoreNames.contains(RESUME_WORKSPACE_STORE)) {
        database.createObjectStore(RESUME_WORKSPACE_STORE)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('INDEXED_DB_OPEN_FAILED'))
  })
}

function runStoreTransaction(storeName, mode, runner) {
  return openRequest().then(
    (database) =>
      new Promise((resolve, reject) => {
        const transaction = database.transaction(storeName, mode)
        const store = transaction.objectStore(storeName)

        let request
        try {
          request = runner(store)
        } catch (error) {
          database.close()
          reject(error)
          return
        }

        transaction.oncomplete = () => {
          database.close()
          resolve(request?.result)
        }
        transaction.onerror = () => {
          const error = transaction.error || request?.error || new Error('INDEXED_DB_TRANSACTION_FAILED')
          database.close()
          reject(error)
        }
        transaction.onabort = () => {
          const error = transaction.error || request?.error || new Error('INDEXED_DB_TRANSACTION_ABORTED')
          database.close()
          reject(error)
        }
      })
  )
}

function runTransaction(mode, runner) {
  return runStoreTransaction(RESUME_DRAFT_STORE, mode, runner)
}

function saveToLocalStorage(resume) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resume))
  return { backend: 'localstorage' }
}

export function openResumeDb() {
  return openRequest()
}

export async function saveResumeDraft(resume) {
  try {
    await runTransaction('readwrite', (store) => store.put(resume, RESUME_DRAFT_KEY))
    return { backend: 'indexeddb' }
  } catch (error) {
    return saveToLocalStorage(resume)
  }
}

export async function loadResumeDraft() {
  if (hasIndexedDb()) {
    try {
      const draft = await runTransaction('readonly', (store) => store.get(RESUME_DRAFT_KEY))
      if (draft) {
        return draft
      }
    } catch (error) {
      // Fall back to localStorage below.
    }
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch (error) {
    return null
  }
}

export async function deleteResumeDraft() {
  try {
    if (hasIndexedDb()) {
      await runTransaction('readwrite', (store) => store.delete(RESUME_DRAFT_KEY))
    }
  } catch (error) {
    // Keep removing local fallback below.
  }

  localStorage.removeItem(STORAGE_KEY)
}

export function hasLegacyLocalDraft() {
  return Boolean(localStorage.getItem(STORAGE_KEY))
}

export async function saveWorkspaceHandle(handle) {
  if (!hasIndexedDb()) return false
  try {
    await runStoreTransaction(RESUME_WORKSPACE_STORE, 'readwrite', (store) =>
      store.put(handle, WORKSPACE_HANDLE_KEY)
    )
    return true
  } catch (error) {
    console.error('Save workspace handle failed:', error)
    return false
  }
}

export async function loadWorkspaceHandle() {
  if (!hasIndexedDb()) return null
  try {
    const handle = await runStoreTransaction(RESUME_WORKSPACE_STORE, 'readonly', (store) =>
      store.get(WORKSPACE_HANDLE_KEY)
    )
    return handle || null
  } catch (error) {
    console.error('Load workspace handle failed:', error)
    return null
  }
}

export async function clearWorkspaceHandle() {
  if (!hasIndexedDb()) return
  try {
    await runStoreTransaction(RESUME_WORKSPACE_STORE, 'readwrite', (store) =>
      store.delete(WORKSPACE_HANDLE_KEY)
    )
  } catch (error) {
    console.error('Clear workspace handle failed:', error)
  }
}

export async function migrateLegacyDraftIfNeeded() {
  if (!hasIndexedDb()) return false
  if (!hasLegacyLocalDraft()) return false

  try {
    const existing = await runTransaction('readonly', (store) => store.get(RESUME_DRAFT_KEY))
    if (existing) return false
  } catch (error) {
    return false
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    await runTransaction('readwrite', (store) => store.put(parsed, RESUME_DRAFT_KEY))
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    return false
  }
}
