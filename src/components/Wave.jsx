import { useRef, useEffect } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { usePlayer } from '../store/playerStore.jsx'
import { DB } from '../services/indexedDB'

const Wave = () => {
  const waveRef = useRef(null)
  const wsRef = useRef(null)
  const { selectedFile } = usePlayer()

  useEffect(() => {
    if (!wsRef.current && waveRef.current) {
      wsRef.current = WaveSurfer.create({
        container: waveRef.current,
        height: '60',
        waveColor: '#ff9800',
        progressColor: '#f57c00',
        cursorColor: '#ededed',
        splitChannels: true,
        responsive: true,
        interact: true,
        autoScroll: true,
        minPxPerSec: 100,
        partialRender: true,
        fillParent: true,
      })

      wsRef.current.on('ready', () => {
        console.log('✅ WaveSurfer pronto!')
      })
    }

    // Carrega o áudio quando selectedFile muda
    const loadAudio = async () => {
      if (!selectedFile || !wsRef.current) return

      console.log('🎵 Carregando:', selectedFile)

      try {
        // Obtém tanto o blob quanto os meta dados (que contêm os peaks)
        const [blob, meta] = await Promise.all([
          DB.getAudioFile(selectedFile),
          DB.getAudioMeta(selectedFile),
        ])

        if (!blob) {
          console.error('Áudio não encontrado no cache:', selectedFile)
          return
        }

        const url = URL.createObjectURL(blob)

        // Usa os peaks pré-calculados se disponíveis
        if (meta?.peaks) {
          wsRef.current.load(url, meta.peaks)
          console.log(
            '📡 Áudio carregado com peaks pré-calculados:',
            selectedFile
          )
        } else {
          wsRef.current.load(url)
          console.log('📡 Áudio carregado (calculando peaks):', selectedFile)
        }
      } catch (error) {
        console.error('Erro ao carregar áudio:', error)
      }
    }

    loadAudio()

    // Limpeza ao desmontar
    return () => {
      if (wsRef.current) {
        wsRef.current.destroy()
        wsRef.current = null
      }
    }
  }, [selectedFile])

  return (
    <div
      ref={waveRef}
      className="flex w-full h-36 overflow-scroll bg-bk-2 rounded-2xl items-center"
      style={{ contain: 'strict' }}
    />
  )
}

export default Wave
