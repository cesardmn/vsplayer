import { useRef, useEffect, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { usePlayer } from '../store/playerStore.jsx'
import { DB } from '../services/indexedDB'

const Wave = () => {
  const waveRef = useRef(null)
  const wsRef = useRef(null)
  const { selectedFile, isPlaying, setIsPlaying } = usePlayer()
  const [currentFile, setCurrentFile] = useState(null)

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
        minPxPerSec: 100,
        partialRender: true,
        fillParent: true,
      })

      wsRef.current.on('ready', () => {
        console.log('✅ WaveSurfer pronto!')
      })

      wsRef.current.on('play', () => setIsPlaying(true))
      wsRef.current.on('pause', () => setIsPlaying(false))
      wsRef.current.on('finish', () => setIsPlaying(false))
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
      <h2 className="text-or-2">
        {(isPlaying ? currentFile : selectedFile)?.split('.')[0] || 'Sem áudio'}
      </h2>
      <div
        ref={waveRef}
        className="flex w-full h-36 overflow-scroll bg-bk-2 rounded-2xl items-center"
        style={{ contain: 'strict' }}
        onClick={togglePlayStop}
      />
    </section>
  )
}

export default Wave
