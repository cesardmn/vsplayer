import { useRef, useEffect, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { usePlayer } from '../store/playerStore.jsx'
import { DB } from '../services/indexedDB'

const Wave = () => {
  const waveRef = useRef(null)
  const wsRef = useRef(null)
  const { selectedFile, isPlaying, setIsPlaying } = usePlayer()
  const [currentFile, setCurrentFile] = useState(null)
  const [duration, setDuration] = useState('0:00')
  const [remainingTime, setRemainingTime] = useState('0:00')
  const [currentTime, setCurrentTime] = useState(0)

  // Formatação de tempo (mesma função usada em useAudioUpload)
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  useEffect(() => {
    if (!wsRef.current && waveRef.current) {
      wsRef.current = WaveSurfer.create({
        container: waveRef.current,
        height: 60,
        waveColor: '#ff9800',
        progressColor: '#f57c00',
        cursorColor: '#ededed',
        splitChannels: true,
        responsive: true,
        interact: false,
        autoScroll: true,
        minPxPerSec: 80,
        partialRender: true,
        fillParent: true,
      })

      wsRef.current.on('ready', () => {
        console.log('✅ WaveSurfer pronto!')
        // Obter duração total quando o áudio estiver pronto
        const totalDuration = wsRef.current.getDuration()
        setDuration(formatDuration(totalDuration))
        setRemainingTime(formatDuration(totalDuration))
      })

      wsRef.current.on('play', () => setIsPlaying(true))
      wsRef.current.on('pause', () => setIsPlaying(false))
      wsRef.current.on('finish', () => setIsPlaying(false))

      // Atualizar tempo atual durante a reprodução
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
  }, [setIsPlaying])

  useEffect(() => {
    const loadAudio = async () => {
      if (!selectedFile || !wsRef.current) return

      if (isPlaying) {
        console.warn('⚠️ Ignorando troca de áudio porque ainda está tocando')
        return
      }

      console.log('🎵 Carregando:', selectedFile)

      try {
        const [blob, meta] = await Promise.all([
          DB.getAudioFile(selectedFile),
          DB.getAudioMeta(selectedFile),
        ])

        if (!blob) {
          console.error('Áudio não encontrado no cache:', selectedFile)
          return
        }

        const url = URL.createObjectURL(blob)

        if (meta?.peaks) {
          wsRef.current.load(url, meta.peaks)
        } else {
          wsRef.current.load(url)
        }

        setCurrentFile(selectedFile) // ← Atualiza o "arquivo em uso"

        console.log('📡 Áudio carregado:', selectedFile)
      } catch (error) {
        console.error('Erro ao carregar áudio:', error)
      }
    }

    loadAudio()
  }, [selectedFile, isPlaying])

  const togglePlayStop = () => {
    if (!wsRef.current) return

    if (isPlaying) {
      wsRef.current.stop()
      setIsPlaying(false)
    } else {
      wsRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <section className="flex flex-col gap-2 bg-bk-1 px-4 py-4 border-t border-gr-3">
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

        <div className="flex justify-between items-center">
          <h2 className="text-or-2 font-medium text-lg truncate max-w-[70%]">
            {(isPlaying ? currentFile : selectedFile)?.split('.')[0] ||
              'Sem áudio'}
          </h2>
          <span
            className={`font-mono text-sm font-bold ${isPlaying ? 'text-or-1' : 'text-gr-2'}`}
          >
            {isPlaying ? `-${remainingTime}` : duration}
          </span>
        </div>
      </div>
    </section>
  )
}

export default Wave
