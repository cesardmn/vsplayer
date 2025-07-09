import { useState, useRef, useEffect, useCallback } from 'react'

const App = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [bufferList, setBufferList] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [, setError] = useState(null) // apenas setError usado

  const audioContextRef = useRef(null)
  const currentSourceRef = useRef(null)

  useEffect(() => {
    return () => {
      if (currentSourceRef.current) {
        currentSourceRef.current.stop()
        currentSourceRef.current.disconnect()
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== 'closed'
      ) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (!files.length) return

    setError(null)
    setTotalFiles(files.length)
    setIsLoading(true)
    setProgress(0)

    try {
      if (
        !audioContextRef.current ||
        audioContextRef.current.state === 'closed'
      ) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)()
      }

      const context = audioContextRef.current
      let completed = 0

      const promises = files.map(async (file) => {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const audioBuffer = await context.decodeAudioData(arrayBuffer)
          completed += 1
          setProgress(completed)
          return { name: file.name, buffer: audioBuffer }
        } catch (err) {
          console.error('Error decoding file:', file.name, err)
          completed += 1
          setProgress(completed)
          return null
        }
      })

      const newBufferList = (await Promise.all(promises)).filter(Boolean)

      if (newBufferList.length === 0) {
        setError('Nenhum arquivo de áudio válido foi carregado')
        return
      }

      setBufferList(newBufferList)
      setSelectedIndex(0)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Erro ao carregar arquivos. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const stopAll = () => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop()
      } catch (e) {
        console.warn('Error stopping source:', e)
      }
      currentSourceRef.current.disconnect()
      currentSourceRef.current = null
    }
    setIsPlaying(false)
  }

  const togglePlay = useCallback(async () => {
    if (!audioContextRef.current || bufferList.length === 0) return

    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume()
      } catch (err) {
        console.error('Error resuming audio context:', err)
        setError('Erro ao iniciar reprodução. Clique novamente.')
        return
      }
    }

    if (isPlaying) {
      stopAll()
      return
    }

    if (!bufferList[selectedIndex]?.buffer) {
      setError('Arquivo de áudio inválido')
      return
    }

    try {
      stopAll()

      const source = audioContextRef.current.createBufferSource()
      source.buffer = bufferList[selectedIndex].buffer
      source.connect(audioContextRef.current.destination)

      source.onended = () => {
        setIsPlaying(false)
        currentSourceRef.current = null
      }

      source.start()
      currentSourceRef.current = source
      setIsPlaying(true)
      setError(null)
    } catch (err) {
      console.error('Playback error:', err)
      setError('Erro ao reproduzir áudio')
      setIsPlaying(false)
    }
  }, [bufferList, selectedIndex, isPlaying])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft' && bufferList.length > 0) {
        event.preventDefault()
        const newIndex = (selectedIndex + 1) % bufferList.length
        setSelectedIndex(newIndex)
      }

      if (event.key === 'ArrowRight' && bufferList.length > 0) {
        event.preventDefault()
        togglePlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [bufferList.length, selectedIndex, isPlaying, togglePlay])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft' && bufferList.length > 0) {
        event.preventDefault()
        const newIndex = (selectedIndex + 1) % bufferList.length
        setSelectedIndex(newIndex)
      }

      if (event.key === 'ArrowRight' && bufferList.length > 0) {
        event.preventDefault()
        togglePlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [bufferList.length, selectedIndex, togglePlay])

  return (
    <main className="relative h-dvh bg-bk-3 text-wt-3 flex flex-col">
      <header className="w-full bg-gradient-to-r from-gr-3 to-bk-1 p-4 shadow-lg z-10">
        <div className="container mx-auto flex items-center gap-3">
          <svg
            className="w-6 h-6 text-or-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <h1 className="text-wt-1 text-xl font-bold">Web Audio Player</h1>
        </div>
      </header>

      <section className="flex-1 overflow-y-auto bg-bk-3 px-4 py-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          {isLoading ? (
            <div className="text-center space-y-4 p-6 bg-bk-2 rounded-lg shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-or-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-sm text-wt-2">
                  Processando áudios: {progress} de {totalFiles} (
                  {Math.round((progress / totalFiles) * 100)}%)
                </p>
              </div>
              <div className="w-full h-2 bg-bk-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-or-3 to-or-1 transition-all duration-300 rounded-full"
                  style={{
                    width: `${(progress / totalFiles) * 100}%`,
                  }}
                />
              </div>
            </div>
          ) : bufferList.length === 0 ? (
            <div className="text-center p-6 bg-bk-2 rounded-lg shadow-lg">
              <label
                htmlFor="audio-upload"
                className="cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-or-1 to-or-2 text-wt-1 text-sm font-medium rounded-lg hover:from-or-2 hover:to-or-3 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Importar áudios
              </label>
              <input
                id="audio-upload"
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={handleUpload}
              />
              <p className="text-gr-1 text-xs mt-3">
                Formatos suportados: MP3, WAV, OGG, etc.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-wt-2 text-lg font-semibold mb-2 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-or-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
                Suas músicas
              </h2>
              <ul className="space-y-2">
                {bufferList.map((item, index) => {
                  const isSelected = selectedIndex === index
                  const isItemBeingPlayed =
                    isPlaying &&
                    currentSourceRef.current?.buffer === item.buffer

                  let itemClass =
                    'flex items-center gap-3 p-3 rounded-lg text-sm transition-all duration-200 cursor-pointer '

                  if (isItemBeingPlayed) {
                    itemClass += 'bg-or-2 text-wt-1'
                  } else if (isSelected) {
                    itemClass += 'bg-bk-2 border border-or-1'
                  } else {
                    itemClass += 'bg-bk-2 hover:bg-bk-1 border border-none'
                  }

                  return (
                    <li
                      key={index}
                      onClick={() => setSelectedIndex(index)}
                      className={itemClass}
                    >
                      <svg
                        className="flex-shrink-0 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                      <span className="truncate">{item.name}</span>

                      {isItemBeingPlayed && (
                        <span className="ml-auto flex items-center gap-1">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-or-1 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-or-1"></span>
                          </span>
                          <span className="text-xs">Tocando</span>
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      <footer className="w-full bg-gr-3 p-4 z-10">
        <div className="container mx-auto flex items-center justify-center">
          {bufferList.length > 0 && (
            <button
              onClick={togglePlay}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-or-1 to-or-2 text-wt-1 rounded-lg font-medium hover:from-or-2 hover:to-or-3 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {isPlaying ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Parar
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Tocar
                </>
              )}
            </button>
          )}
        </div>
      </footer>
    </main>
  )
}

export default App
