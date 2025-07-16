import { useEffect } from 'react'
import { usePlayer } from '../store/playerStore.jsx'

const AudioList = () => {
  const { fileList, selectedFile, setSelectedFile } = usePlayer()

  useEffect(() => {
    if (fileList.length > 0 && !selectedFile) {
      setSelectedFile(fileList[0])
    }
  }, [fileList, selectedFile, setSelectedFile])

  const handleSelect = (file) => {
    if (file !== selectedFile) {
      setSelectedFile(file)
    }
  }

  return (
    <ul className="h-full space-y-4 overflow-y-auto p-2">
      {fileList.length > 0 &&
        [...fileList].sort().map((file) => (
          <li
            key={file}
            className={`p-4 rounded-md cursor-pointer border ${
              file === selectedFile
                ? 'bg-or-2/10 text-wt-3 border-or-3'
                : 'bg-bk-2 text-wt-3 border-gr-3 hover:bg-bk-1'
            }`}
            onClick={() => handleSelect(file)}
          >
            {file.split('.')[0]}
          </li>
        ))}
    </ul>
  )
}

export default AudioList
