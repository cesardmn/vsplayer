// src/components/Header.jsx
import { MdOutlineScreenLockPortrait, MdDelete } from 'react-icons/md'
import { useState, useEffect } from 'react'
import { usePlayer } from '../store/playerStore'
import { DB } from '../services/indexedDB'

const Header = () => {
  const [wakeLock, setWakeLock] = useState(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toggleInfoShow, setFileList } = usePlayer()

  const toggleLockScreen = async () => {
    if (isLocked) {
      await releaseWakeLock()
    } else {
      await requestWakeLock()
    }
  }

  const handleInfoToggle = () => {
    console.log('Info toggled')
    toggleInfoShow((prev) => !prev)
  }

  const handleClearDB = async () => {
    if (confirm('Tem certeza que deseja limpar todos os áudios salvos?')) {
      try {
        const db = await DB.openDB()
        const tx = db.transaction('audios', 'readwrite')
        const store = tx.objectStore('audios')
        const clearReq = store.clear()

        clearReq.onsuccess = () => {
          console.log('IndexedDB limpo com sucesso')
          setFileList([]) // Limpa a lista de arquivos no estado
        }

        clearReq.onerror = (error) => {
          console.error('Erro ao limpar IndexedDB:', error)
        }
      } catch (error) {
        console.error('Erro ao acessar IndexedDB:', error)
      }
    }
  }

  const requestWakeLock = async () => {
    if (!('wakeLock' in navigator)) {
      console.warn('Wake Lock API not supported')
      return
    }

    setIsLoading(true)
    try {
      const lock = await navigator.wakeLock.request('screen')
      setWakeLock(lock)
      setIsLocked(true)

      lock.addEventListener('release', () => {
        setIsLocked(false)
      })
    } catch (err) {
      console.error('Error requesting wake lock:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const releaseWakeLock = async () => {
    if (wakeLock) {
      await wakeLock.release()
      setWakeLock(null)
      setIsLocked(false)
    }
  }

  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release()
      }
    }
  }, [wakeLock])

  return (
    <header className="w-full flex justify-between items-center p-4">
      <h1 className="font-bold text-3xl" onClick={handleInfoToggle}>
        <span className="text-or-3">VS</span>
        &nbsp;
        <span>Player</span>
      </h1>

      <div className="flex gap-4">
        <button
          onClick={handleClearDB}
          aria-label="Limpar todos os áudios"
          className="cursor-pointer text-gr-2 hover:text-or-3 transition-colors"
          title="Limpar todos os áudios"
        >
          <MdDelete size={24} />
        </button>

        <button
          onClick={toggleLockScreen}
          disabled={isLoading}
          aria-label={
            isLocked
              ? 'Desativar tela sempre ligada'
              : 'Ativar tela sempre ligada'
          }
          className="cursor-pointer"
        >
          <MdOutlineScreenLockPortrait
            size={24}
            className={isLocked ? 'text-or-3' : 'text-gr-2'}
          />
        </button>
      </div>
    </header>
  )
}

export default Header
