import { useState, useRef, useEffect, useCallback } from 'react'
import WavesurferPlayer from '@wavesurfer/react'
import { MdOutlineLibraryMusic } from 'react-icons/md'
import { FaPlus, FaMinus, FaInfoCircle, FaPlay, FaPause } from 'react-icons/fa'

const App = () => {
  const [audioFiles, setAudioFiles] = useState([])
  const [readyCount, setReadyCount] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [playingCount, setPlayingCount] = useState(0)

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

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-dvh w-dvw bg-bk-3 text-gr-1 gap-2">
      {/* TOP BAR */}
      <section className="bg-[#1a1a1a] p-4 flex justify-between items-center gap-4 shadow-md border-b border-[#333]">
        <FaInfoCircle
          size={24}
          className="text-[#888] hover:text-white cursor-pointer"
        />

        <label
          htmlFor="audio-upload"
          className="cursor-pointer p-2 rounded-full hover:bg-[#2a2a2a] transition-colors"
        >
          <MdOutlineLibraryMusic
            size={24}
            className="text-[#ccc] hover:text-white"
          />
        </label>
        <input
          id="audio-upload"
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />
      </section>

      {/* AUDIO LIST */}
      <section className="bg-[#1a1a1a] overflow-y-auto p-4">
        {audioFiles.length > 0 && allReady && (
          <div className="space-y-2">
            <ul className="space-y-2">
              {audioFiles.map((file, index) => {
                const isPlaying =
                  playersRef.current[index]?.isPlaying?.() ?? false
                const isSelected = selectedIndex === index

                let itemClass =
                  'flex items-center p-3 rounded-lg cursor-pointer transition-all'
                if (isPlaying) {
                  itemClass +=
                    ' bg-gradient-to-r from-[#f57c00] to-[#ff9800] text-white shadow-md'
                } else if (isSelected) {
                  itemClass +=
                    ' bg-[#2a2a2a] hover:bg-[#333] border border-[#ff9800]'
                } else {
                  itemClass +=
                    ' bg-[#2a2a2a] hover:bg-[#333] border border-[#444]'
                }

                return (
                  <li
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={itemClass}
                  >
                    <span className="truncate flex-1">
                      {file.name.replace(/\.[^/.]+$/, '')}
                    </span>
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
              className="text-[#ff9800] mb-4 animate-pulse"
            />

            <p className="text-[#aaa] mb-2">
              Processando {readyCount}/{audioFiles.length} áudios...
            </p>

            <div className="w-full max-w-md bg-[#333] rounded-full overflow-hidden h-4 shadow-inner">
              <div
                className="bg-[#ff9800] h-full transition-all duration-300 ease-out"
                style={{
                  width: `${(readyCount / audioFiles.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {audioFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MdOutlineLibraryMusic size={48} className="text-[#555] mb-4" />
            <h3 className="text-xl font-medium text-[#888] mb-2">
              Nenhum áudio carregado
            </h3>
          </div>
        )}
      </section>

      {/* PLAYER + CONTROLES */}
      <section className="bg-[#1a1a1a] grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-4 border-t border-[#333]">
        {/* LEFT VOLUME */}
        <div className="flex flex-col gap-4 items-center justify-center">
          <button className="p-2 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors">
            <FaPlus className="text-white" />
          </button>
          <button className="p-2 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors">
            <FaMinus className="text-white" />
          </button>
        </div>

        {/* WAVEFORM DISPLAY */}
        <div
          className="w-full flex flex-col gap-2 overflow-x-auto"
          onClick={togglePlayStop}
        >
          {audioFiles.map((file, index) => (
            <div
              key={index}
              hidden={selectedIndex !== index || !allReady}
              className="bg-[#2a2a2a] rounded-lg p-3 shadow-sm"
            >
              <WavesurferPlayer
                height={50}
                url={file.url}
                waveColor="#ff9800"
                progressColor="#f57c00"
                cursorColor="#ededed"
                splitChannels={true}
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
        <div className="flex flex-col gap-4 items-center justify-center">
          <button className="p-2 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors">
            <FaPlus className="text-white" />
          </button>
          <button className="p-2 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors">
            <FaMinus className="text-white" />
          </button>
        </div>
      </section>
    </div>
  )
}

export default App
