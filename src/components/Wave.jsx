import { useRef, useEffect, useState, useCallback } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { usePlayer } from '../store/playerStore.jsx'
import { DB } from '../services/indexedDB'
import { useKeyboardListeners } from '../hooks/useKeyboardListeners'

const Wave = () => {
  const waveRef = useRef(null)
  const wsRef = useRef(null)
  const { selectedFile, isPlaying, setIsPlaying } = usePlayer()
  const [currentFile, setCurrentFile] = useState(null)
  const [duration, setDuration] = useState('0:00')
  const [remainingTime, setRemainingTime] = useState('0:00')
  const [currentTime, setCurrentTime] = useState(0)

  const formatDuration = useCallback((seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }, [])

  const togglePlayStop = useCallback(() => {
    if (!wsRef.current) return
    if (isPlaying) {
      wsRef.current.stop()
      setIsPlaying(false)
    } else {
      wsRef.current.play()
      setIsPlaying(true)
    }
  }, [isPlaying, setIsPlaying])

  useKeyboardListeners({
    onPlayPause: togglePlayStop,
  })

  useEffect(() => {
    if (!wsRef.current && waveRef.current) {
      wsRef.current = WaveSurfer.create({
        container: waveRef.current,
        height: 60,
        waveColor: '#0d0d0d',
        progressColor: '#ef6c00',
        cursorColor: '#e0e0e0',
        splitChannels: true,
        responsive: true,
        interact: false,
        autoScroll: true,
        minPxPerSec: 80,
        partialRender: true,
        fillParent: true,
      })

      wsRef.current.on('ready', () => {
        const totalDuration = wsRef.current.getDuration()
        setDuration(formatDuration(totalDuration))
        setRemainingTime(formatDuration(totalDuration))
      })

      wsRef.current.on('play', () => setIsPlaying(true))
      wsRef.current.on('pause', () => setIsPlaying(false))
      wsRef.current.on('finish', () => setIsPlaying(false))

      wsRef.current.on('audioprocess', () => {
        if (wsRef.current) {
          const time = wsRef.current.getCurrentTime()
          setCurrentTime(time)
          const totalDuration = wsRef.current.getDuration()
          setRemainingTime(formatDuration(totalDuration - time))
        }
      })
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.destroy()
        wsRef.current = null
      }
    }
  }, [setIsPlaying, formatDuration])

  useEffect(() => {
    const loadAudio = async () => {
      if (!selectedFile || !wsRef.current) return
      if (isPlaying) return

      try {
        const [blob, meta] = await Promise.all([
          DB.getAudioFile(selectedFile),
          DB.getAudioMeta(selectedFile),
        ])

        if (!blob) return

        const url = URL.createObjectURL(blob)
        if (meta?.peaks) {
          wsRef.current.load(url, meta.peaks)
        } else {
          wsRef.current.load(url)
        }

        setCurrentFile(selectedFile)
      } catch (error) {
        console.error('Erro ao carregar áudio:', error)
      }
    }

    loadAudio()
  }, [selectedFile, isPlaying])

  return (
    <section className="wave-container flex flex-col gap-2 bg-bk-1 px-4 py-4 border-t border-gr-3">
      <div
        ref={waveRef}
        className="flex w-full h-36 overflow-scroll bg-bk-2 rounded-2xl items-center"
        style={{ contain: 'strict' }}
        onClick={togglePlayStop}
      />
      <div className="w-full space-y-1 px-2">
        {isPlaying && (
          <div className="w-full bg-bk-2 h-1 rounded-full overflow-hidden">
            <div
              className="bg-or-1 h-full rounded-full transition-all duration-300"
              style={{
                width: `${(currentTime / wsRef.current?.getDuration()) * 100 || 0}%`,
              }}
            />
          </div>
        )}

        <div
          className={`flex justify-between items-center ${isPlaying ? 'text-wt-3' : 'text-gr-2'}`}
        >
          <h2>
            {(isPlaying ? currentFile : selectedFile)?.split('.')[0] || ''}
          </h2>
          <span>{isPlaying ? `-${remainingTime}` : duration}</span>
        </div>
      </div>
    </section>
  )
}

export default Wave
