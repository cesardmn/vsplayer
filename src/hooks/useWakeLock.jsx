import { useState, useEffect } from 'react'

export const useWakeLock = () => {
  const [wakeLock, setWakeLock] = useState(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

  const toggleLockScreen = async () => {
    if (isLocked) {
      await releaseWakeLock()
    } else {
      await requestWakeLock()
    }
  }

  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release()
      }
    }
  }, [wakeLock])

  return { isLocked, isLoading, toggleLockScreen }
}
