const DB_NAME = 'UserAudioDB'
const STORE = 'audios'

export const DB = (() => {
  const openDB = async () => {
    return new Promise((res, rej) => {
      const req = indexedDB.open(DB_NAME, 1)
      req.onerror = () => rej(req.error)
      req.onsuccess = () => res(req.result)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'name' })
          store.createIndex('lastModified', 'lastModified', { unique: false })
        }
      }
    })
  }

  const getAll = async () => {
    const db = await openDB()
    return new Promise((res) => {
      const tx = db.transaction(STORE, 'readonly').objectStore(STORE)
      const req = tx.openCursor()
      const all = []
      req.onsuccess = () => {
        const cursor = req.result
        if (!cursor) return res(all)
        all.push(cursor.value)
        cursor.continue()
      }
    })
  }

  const getAudioMeta = async (name) => {
    const db = await openDB()
    return new Promise((res) => {
      const tx = db.transaction(STORE, 'readonly').objectStore(STORE).get(name)
      tx.onsuccess = () => {
        const record = tx.result
        if (!record) return res(null)
        const { name: n, duration, lastModified, peaks } = record
        res({ name: n, duration, lastModified, peaks })
      }
    })
  }

  const saveAudio = async (name, meta, fileBlob) => {
    const db = await openDB()
    return new Promise((res) => {
      const fullRecord = {
        name,
        lastModified: meta.lastModified,
        duration: meta.duration,
        peaks: meta.peaks,
        file: fileBlob,
      }
      const tx = db
        .transaction(STORE, 'readwrite')
        .objectStore(STORE)
        .put(fullRecord)
      tx.onsuccess = () => {
        console.log('[indexeddb] Saved', name)
        res(true)
      }
    })
  }

  const deleteAudio = async (name) => {
    const db = await openDB()
    return new Promise((res) => {
      const tx = db
        .transaction(STORE, 'readwrite')
        .objectStore(STORE)
        .delete(name)
      tx.onsuccess = () => res(true)
    })
  }

  const getAudioFile = async (name) => {
    const db = await openDB()
    return new Promise((res) => {
      const tx = db.transaction(STORE, 'readonly').objectStore(STORE).get(name)
      tx.onsuccess = () => {
        const record = tx.result
        console.log('[indexeddb] getAudioFile', name, !!record?.file)
        res(record?.file || null)
      }
    })
  }

  return {
    openDB,
    getAll,
    getAudioMeta,
    saveAudio,
    deleteAudio,
    getAudioFile,
  }
})()
