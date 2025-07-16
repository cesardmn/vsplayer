import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Info from './components/Info.jsx'
import Loader from './components/Loader.jsx'
import AudioList from './components/AudioList.jsx'
import Wave from './components/Wave.jsx'

import { usePlayer } from './store/playerStore.jsx'

const App = () => {
  const { infoShow, fileList, setFileList } = usePlayer()

  useEffect(() => {
    setFileList([])
  }, [setFileList])

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-[100dvh] w-dvw bg-bk-3 text-gr-1 gap-2 safe-area">
      <section className="bg-bk-2">
        <Header />
      </section>

      <section className="bg-bk-2 overflow-y-hidden relative">
        {infoShow && <Info />}
        <Loader />
        <AudioList />
      </section>

      {!infoShow && fileList.length > 0 && <Wave />}
    </div>
  )
}

export default App
