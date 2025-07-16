import { useEffect } from 'react'

export const useKeyboardListeners = ({
  onNavigateLeft,
  onPlayPause,
  disabled = false,
}) => {
  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && onNavigateLeft) {
        onNavigateLeft()
      } else if (e.key === 'ArrowRight' && onPlayPause) {
        onPlayPause()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNavigateLeft, onPlayPause, disabled])
}
