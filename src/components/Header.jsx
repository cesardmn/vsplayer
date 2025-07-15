import { MdOutlineScreenLockPortrait } from 'react-icons/md'
import { useState, useEffect } from 'react'

const Header = () => {
  const [wakeLock, setWakeLock] = useState(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const toggleLockScreen = async () => {
    if (isLocked) {
      await releaseWakeLock()
    } else {
      await requestWakeLock()
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
      <h1 className="font-bold text-3xl">
        <span className="text-or-3">VS</span>
        &nbsp;
        <span>Player</span>
      </h1>

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
          className={isLocked && 'text-or-3'}
        />
      </button>
    </header>
  )
}

export default Header
