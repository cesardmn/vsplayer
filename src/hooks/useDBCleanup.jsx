import { DB } from '../services/indexedDB'

export const useDBCleanup = (setFileList) => {
  const handleClearDB = async () => {
    if (confirm('Tem certeza que deseja limpar todos os áudios salvos?')) {
      try {
        const db = await DB.openDB()
        const tx = db.transaction('audios', 'readwrite')
        const store = tx.objectStore('audios')
        const clearReq = store.clear()

        clearReq.onsuccess = () => {
          console.log('IndexedDB limpo com sucesso')
          setFileList([])
        }

        clearReq.onerror = (error) => {
          console.error('Erro ao limpar IndexedDB:', error)
        }
      } catch (error) {
        console.error('Erro ao acessar IndexedDB:', error)
      }
    }
  }

  return { handleClearDB }
}
