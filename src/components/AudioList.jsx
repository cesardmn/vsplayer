import { useEffect } from 'react'
import { usePlayer } from '../store/playerStore.jsx'

const AudioList = () => {
  const { fileList, selectedFile, setSelectedFile } = usePlayer()

  useEffect(() => {
    if (fileList.length > 0 && !selectedFile) {
      setSelectedFile(fileList[0].name)
    }
  }, [fileList, selectedFile, setSelectedFile])

  const handleSelect = (file) => {
    // console.log(file)
    if (file.name !== selectedFile) {
      setSelectedFile(file.name)
    }
  }

  return (
    <ul className="h-full space-y-4 overflow-y-auto p-2">
      {fileList.length > 0 &&
        [...fileList].sort().map((file) => (
          <li
            key={file}
            className={`flex justify-between  p-4 rounded-md cursor-pointer border font-bolder ${
              file.name === selectedFile
                ? 'bg-or-2/10 text-wt-3 border-or-3'
                : 'bg-bk-2 text-gr-2 border-gr-3 hover:bg-bk-1'
            }`}
            onClick={() => handleSelect(file)}
          >
            <span className="">{file.name.split('.')[0]}</span>
            <span>{file.duration}</span>
          </li>
        ))}
    </ul>
  )
}

export default AudioList
