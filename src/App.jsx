import { useState, useRef, useEffect, useCallback } from 'react'
import WavesurferPlayer from '@wavesurfer/react'
import { MdOutlineLibraryMusic } from 'react-icons/md'
import {
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaPlay,
  FaArrowRight,
} from 'react-icons/fa'
import { RiApps2AddFill } from 'react-icons/ri'

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
}

const App = () => {
  const [audioFiles, setAudioFiles] = useState([])
  const [readyCount, setReadyCount] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [playingCount, setPlayingCount] = useState(0) // Corrigido: inicializado com 0

  const [wakeLockSupported, setWakeLockSupported] = useState(false)
  const [wakeLockEnabled, setWakeLockEnabled] = useState(false)
  const wakeLockRef = useRef(null)

  const playersRef = useRef([])

  const allReady = audioFiles.length > 0 && readyCount === audioFiles.length
  const isAnyPlaying = playingCount > 0

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files)
    const formatted = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))
    playersRef.current = []
    setReadyCount(0)
    setPlayingCount(0)
    setSelectedIndex(0)
    setAudioFiles(formatted)
  }

  const handleReady = (index, ws) => {
    playersRef.current[index] = ws
    setReadyCount((prev) => prev + 1)

    ws.on('timeupdate', () => {
      setAudioFiles((prev) => [...prev])
    })
  }

  const togglePlayStop = useCallback(() => {
    const players = playersRef.current
    const anyPlaying = players.some((p) => p && p.isPlaying())
    players.forEach((p) => p && p.stop())
    if (!anyPlaying) {
      const selected = players[selectedIndex]
      if (selected) selected.play()
    }
  }, [selectedIndex])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (audioFiles.length === 0) return

      if (e.key === 'ArrowRight') {
        togglePlayStop()
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) =>
          prev === audioFiles.length - 1 ? 0 : prev + 1
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [audioFiles.length, togglePlayStop])

  useEffect(() => {
    setWakeLockSupported('wakeLock' in navigator)
  }, [])

  const toggleWakeLock = async () => {
    if (!wakeLockSupported) return

    try {
      if (!wakeLockEnabled) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
        wakeLockRef.current.addEventListener('release', () => {
          setWakeLockEnabled(false)
        })
        setWakeLockEnabled(true)
      } else if (wakeLockRef.current) {
        await wakeLockRef.current.release()
        wakeLockRef.current = null
        setWakeLockEnabled(false)
      }
    } catch (err) {
      console.error('Wake Lock error:', err)
      setWakeLockEnabled(false)
    }
  }

  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-dvh w-dvw bg-bk-3 text-gr-1 gap-0">
      {/* TOP BAR */}
      <header className="bg-bk-2 p-4 flex justify-between items-center border-b border-gr-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gr-1">
            <span className="text-or-1">VS</span> PLAYER
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {wakeLockSupported && (
            <div className="flex items-center gap-2">
              <span className="ms-3 text-sm font-medium text-gr-1">
                {wakeLockEnabled ? 'Tela ativa' : 'Manter tela ligada'}
              </span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={wakeLockEnabled}
                  onChange={toggleWakeLock}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-bk-1 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-wt-1 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-gr-1 after:border-gr-3 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-or-2"></div>
              </label>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex flex-col bg-bk-2 overflow-hidden">
        {/* AUDIO LIST */}
        <section className="flex-1 overflow-y-auto p-4">
          {audioFiles.length > 0 && allReady && (
            <div className="space-y-3">
              <ul className="space-y-2">
                {audioFiles.map((file, index) => {
                  const isPlaying =
                    playersRef.current[index]?.isPlaying?.() ?? false
                  const isSelected = selectedIndex === index

                  let itemClass =
                    'flex items-center p-3 rounded-lg cursor-pointer transition-all border'
                  if (isPlaying) {
                    itemClass +=
                      ' bg-gradient-to-r from-or-3 to-or-1 text-wt-1 shadow-lg border-transparent'
                  } else if (isSelected) {
                    itemClass += ' bg-bk-1 hover:bg-gr-3 border-or-2'
                  } else {
                    itemClass += ' bg-bk-1 hover:bg-gr-3 border-gr-3'
                  }

                  return (
                    <li
                      key={index}
                      onClick={() => setSelectedIndex(index)}
                      className={itemClass}
                    >
                      <span className="truncate flex-1 text-gr-1">
                        {file.name.replace(/\.[^/.]+$/, '')}
                      </span>
                      {isPlaying ? (
                        <div className="ml-2 text-sm font-mono">
                          {formatTime(
                            playersRef.current[index]?.getDuration() -
                              playersRef.current[index]?.getCurrentTime()
                          )}
                        </div>
                      ) : (
                        <div className="ml-2 text-sm font-mono text-gr-2">
                          {formatTime(playersRef.current[index]?.getDuration())}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {audioFiles.length > 0 && !allReady && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MdOutlineLibraryMusic
                size={48}
                className="text-or-1 mb-4 animate-pulse"
              />
              <p className="text-gr-1 mb-2">
                Processing {readyCount + 1}/{audioFiles.length} audio files...
              </p>
              <div className="w-full max-w-md bg-gr-3 rounded-full overflow-hidden h-2">
                <div
                  className="bg-gradient-to-r from-or-3 to-or-1 h-full transition-all duration-300 ease-out"
                  style={{
                    width: `${((readyCount + 1) / audioFiles.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {audioFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="bg-bk-1 p-8 rounded-xl border border-gr-3 max-w-md w-full">
                <MdOutlineLibraryMusic
                  size={48}
                  className="text-or-1 mb-4 mx-auto animate-bounce"
                  style={{ animationDuration: '2s' }}
                />

                <div className="flex justify-center mb-6">
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer bg-gradient-to-r from-or-3 to-or-1 text-wt-1 px-5 py-2.5 rounded-lg font-medium shadow-md hover:shadow-or-1/30 transition-all text-center"
                  >
                    Clique em "Add" para adicionar arquivos
                  </label>
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    multiple
                    className="hidden"
                    onChange={handleFilesChange}
                  />
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="bg-bk-2 p-2 rounded-lg border border-gr-3">
                      <FaPlay className="text-or-1 text-xs" />
                    </div>
                    <p className="text-gr-1 flex-1">
                      Clique na{' '}
                      <span className="text-or-1 font-medium">onda sonora</span>{' '}
                      para Play/Stop
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-bk-2 p-2 rounded-lg border border-gr-3">
                      <span className="text-or-1 font-mono text-xs">
                        <FaArrowLeft />
                      </span>
                    </div>
                    <p className="text-gr-1 flex-1">
                      Use a{' '}
                      <span className="text-or-1 font-medium">
                        seta esquerda
                      </span>{' '}
                      para navegar entre os áudios
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-bk-2 p-2 rounded-lg border border-gr-3">
                      <span className="text-or-1 font-mono text-xs">
                        <FaArrowRight />
                      </span>
                    </div>
                    <p className="text-gr-1 flex-1">
                      Use a{' '}
                      <span className="text-or-1 font-medium">
                        seta direita
                      </span>{' '}
                      para Play/Stop
                    </p>
                  </div>

                  {wakeLockSupported && (
                    <div className="flex items-start gap-3">
                      <div className="bg-bk-2 p-2 rounded-lg border border-gr-3">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-or-1"></div>
                        </div>
                      </div>
                      <p className="text-gr-1 flex-1">
                        Ative{' '}
                        <span className="text-or-1 font-medium">
                          "Manter tela ligada"
                        </span>{' '}
                        no cabeçalho para evitar que a tela desligue
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* PLAYER CONTROLS */}
        <section className="bg-bk-1 px-4 py-4 border-t border-gr-3 space-y-3">
          {/* AUDIO INFO */}
          {allReady && (
            <div
              className={`flex items-center p-3 rounded-lg transition-all ${
                isAnyPlaying
                  ? 'bg-gradient-to-r from-or-3 to-or-1 text-wt-1'
                  : 'bg-bk-2 border border-or-2'
              }`}
            >
              <span className="truncate flex-1 text-base font-medium">
                {audioFiles[
                  isAnyPlaying
                    ? audioFiles.findIndex((_, i) =>
                        playersRef.current[i]?.isPlaying?.()
                      )
                    : selectedIndex
                ]?.name.replace(/\.[^/.]+$/, '')}
              </span>

              {isAnyPlaying ? (
                <div className="ml-2 text-sm font-mono">
                  {formatTime(
                    playersRef.current[
                      audioFiles.findIndex((_, i) =>
                        playersRef.current[i]?.isPlaying?.()
                      )
                    ]?.getDuration() -
                      playersRef.current[
                        audioFiles.findIndex((_, i) =>
                          playersRef.current[i]?.isPlaying?.()
                        )
                      ]?.getCurrentTime()
                  )}
                </div>
              ) : (
                <div className="ml-2 text-sm font-mono text-gr-2">
                  {formatTime(playersRef.current[selectedIndex]?.getDuration())}
                </div>
              )}
            </div>
          )}

          {/* WAVEFORM CONTAINER */}
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 items-center">
            {/* LEFT VOLUME */}
            <div className="flex flex-col gap-3 items-center justify-center">
              <button className="p-2 rounded-lg bg-bk-2 hover:bg-gr-3 transition-colors text-or-1 hover:text-or-2">
                <FaPlus size={16} />
              </button>
              <button className="p-2 rounded-lg bg-bk-2 hover:bg-gr-3 transition-colors text-or-1 hover:text-or-2">
                <FaMinus size={16} />
              </button>
            </div>

            {/* WAVEFORM DISPLAY */}
            <div className="w-full overflow-x-auto" onClick={togglePlayStop}>
              {audioFiles.map((file, index) => (
                <div
                  key={index}
                  hidden={selectedIndex !== index || !allReady}
                  className="bg-bk-2 rounded-lg p-3 border border-gr-3"
                >
                  <WavesurferPlayer
                    height={50}
                    url={file.url}
                    waveColor="#ff9800"
                    progressColor="#f57c00"
                    cursorColor="#ededed"
                    splitChannels={true}
                    color-wt-1
                    responsive={false}
                    interact={false}
                    autoScroll={true}
                    minPxPerSec={80}
                    onReady={(ws) => handleReady(index, ws)}
                    onPlay={() => setPlayingCount((c) => c + 1)}
                    onPause={() => setPlayingCount((c) => Math.max(c - 1, 0))}
                  />
                </div>
              ))}
            </div>

            {/* RIGHT VOLUME */}
            <div className="flex flex-col gap-3 items-center justify-center">
              <button className="p-2 rounded-lg bg-bk-2 hover:bg-gr-3 transition-colors text-or-1 hover:text-or-2">
                <FaPlus size={16} />
              </button>
              <button className="p-2 rounded-lg bg-bk-2 hover:bg-gr-3 transition-colors text-or-1 hover:text-or-2">
                <FaMinus size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
