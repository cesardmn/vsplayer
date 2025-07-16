import { useEffect, useState } from 'react'
import { usePlayer } from '../store/playerStore.jsx'

const AudioList = () => {
  const { fileList } = usePlayer()
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setSelected(fileList[0])
  }, [fileList])

  return (
    <ul className="h-full space-y-4 overflow-y-auto p-2">
      {fileList.length > 0 &&
        [...fileList].sort().map((file, index) => {
          return (
            <li
              key={index}
              className={`p-4 rounded-md cursor-pointer border ${
                selected === file
                  ? 'bg-or-2/10 text-wt-3 border-or-3'
                  : 'bg-bk-2 text-wt-3 border-gr-3 hover:bg-bk-1'
              }`}
              onClick={() => setSelected(file)}
            >
              {file.split('.')[0]}
            </li>
          )
        })}
    </ul>
  )
}

export default AudioList
