import { useRef, useEffect, useCallback, useMemo } from 'react'
import { usePlayer } from '../store/playerStore.jsx'
import { useKeyboardListeners } from '../hooks/useKeyboardListeners'

const AudioList = () => {
  const { fileList, selectedFile, setSelectedFile } = usePlayer()
  const itemRefs = useRef({})

  const sortedFileList = useMemo(() => {
    return [...fileList].sort((a, b) => a.name.localeCompare(b.name))
  }, [fileList])

  const handleNavigateLeft = useCallback(() => {
    if (sortedFileList.length > 0) {
      const currentIndex = sortedFileList.findIndex(
        (f) => f.name === selectedFile
      )
      const nextIndex = (currentIndex + 1) % sortedFileList.length
      const nextFile = sortedFileList[nextIndex]
      setSelectedFile(nextFile.name)
    }
  }, [sortedFileList, selectedFile, setSelectedFile])

  useKeyboardListeners({
    onNavigateLeft: handleNavigateLeft,
  })

  useEffect(() => {
    if (selectedFile && itemRefs.current[selectedFile]) {
      itemRefs.current[selectedFile].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [selectedFile])

  return (
    <ul className="h-full space-y-4 overflow-y-auto p-2">
      {sortedFileList.map((file) => (
        <li
          key={file.name}
          ref={(el) => (itemRefs.current[file.name] = el)}
          className={`flex justify-between p-4 rounded-md cursor-pointer border font-bolder ${
            file.name === selectedFile
              ? 'bg-or-2/10 text-wt-3 border-or-3'
              : 'bg-bk-2 text-gr-2 border-gr-3 hover:bg-bk-1'
          }`}
          onClick={() => setSelectedFile(file.name)}
        >
          <span>{file.name.split('.')[0]}</span>
          <span>{file.duration}</span>
        </li>
      ))}
    </ul>
  )
}

export default AudioList
