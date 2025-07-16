import {
  MdOutlineScreenLockPortrait,
  MdDelete,
  MdInstallDesktop,
} from 'react-icons/md'
import { usePlayer } from '../store/playerStore'
import { useWakeLock } from '../hooks/useWakeLock'
import { usePWAInstall } from '../hooks/usePWAInstall'
import { useDBCleanup } from '../hooks/useDBCleanup'

const Header = () => {
  const { toggleInfoShow, setFileList } = usePlayer()
  const { isLocked, isLoading, toggleLockScreen } = useWakeLock()
  const { deferredPrompt, isAppInstalled, handleInstallClick } = usePWAInstall()
  const { handleClearDB } = useDBCleanup(setFileList)

  const handleInfoToggle = () => {
    console.log('Info toggled')
    toggleInfoShow((prev) => !prev)
  }

  return (
    <header className="w-full flex justify-between items-center p-4">
      <h1 className="font-bold text-3xl" onClick={handleInfoToggle}>
        <span className="text-or-3">VS</span>
        &nbsp;
        <span>Player</span>
      </h1>

      <div className="flex gap-4">
        {!isAppInstalled && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            aria-label="Instalar aplicativo"
            className="cursor-pointer text-gr-2 hover:text-or-3 transition-colors"
            title="Instalar aplicativo"
          >
            <MdInstallDesktop size={24} />
          </button>
        )}

        <button
          onClick={handleClearDB}
          aria-label="Limpar todos os áudios"
          className="cursor-pointer text-gr-2 hover:text-or-3 transition-colors"
          title="Limpar todos os áudios"
        >
          <MdDelete size={24} />
        </button>

        <button
          onClick={toggleLockScreen}
          disabled={isLoading}
          aria-label={
            isLocked
              ? 'Desativar tela sempre ligada'
              : 'Ativar tela sempre ligada'
          }
          className="cursor-pointer"
        >
          <MdOutlineScreenLockPortrait
            size={24}
            className={isLocked ? 'text-or-3' : 'text-gr-2'}
            aria-label="Manter tela ligada"
            title="Manter tela ligada"
          />
        </button>
      </div>
    </header>
  )
}

export default Header
