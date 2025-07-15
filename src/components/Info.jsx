import {
  MdOutlineLibraryMusic,
  MdOutlineScreenLockPortrait
} from 'react-icons/md'
import {
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa'

import { PiWaveformBold } from "react-icons/pi";

import { useAudioUpload } from '../hooks/useAudioUpload'

const Info = () => {

  const { processFiles } = useAudioUpload()

  const handleFilesUpload = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    processFiles(files)
  }

  return (
    <div className="flex flex-col items-center justify-start h-full overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Card principal de upload */}
      <div className="bg-bk-1 px-6 py-8 rounded-xl border border-gr-3 w-full max-w-md shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <MdOutlineLibraryMusic
            size={48}
            className="text-or-1 mb-2 mx-auto animate-pulse"
            style={{ animationDuration: '2s' }}
          />


          <label
            htmlFor="audio-upload"
            className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg font-medium transition-all
                     bg-gradient-to-r from-or-3 to-or-1 text-bk-1 hover:shadow-lg hover:shadow-or-1/30
                     focus:outline-none focus:ring-2 focus:ring-or-3 focus:ring-offset-2 focus:ring-offset-bk-2"
          >
            <h2 className="text-xl font-bold text-wt-1 mb-2">Adicionar Músicas</h2>
          </label>

          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={handleFilesUpload}
          />

          <p className="text-sm text-gr-2 mt-2">
            Formatos suportados: MP3, WAV, AAC
          </p>
        </div>
      </div>

      {/* Lista de instruções */}
      <div className="w-full max-w-md space-y-5">
        <h3 className="text-lg font-semibold text-gr-1 border-b border-gr-3 pb-2">
          Como Usar
        </h3>

        {/* Item de instrução */}
        <div className="flex items-start gap-4 p-3 rounded-lg bg-bk-2/50 hover:bg-bk-2 transition-colors">
          <div className="bg-bk-1 p-3 rounded-lg border border-or-1/50 flex-shrink-0">
            <PiWaveformBold className="text-or-1 text-sm" />
          </div>
          <div>
            <p className="text-gr-1">
              <span className="text-or-1 font-medium">Clique na wave</span> para Play/Stop.
            </p>
          </div>
        </div>

        {/* Item de instrução */}
        <div className="flex items-start gap-4 p-3 rounded-lg bg-bk-2/50 hover:bg-bk-2 transition-colors">
          <div className="bg-bk-1 p-3 rounded-lg border border-or-1/50 flex-shrink-0">
            <FaArrowLeft className="text-or-1 text-sm" />
          </div>
          <div>
            <p className="text-gr-1">
              Use a <span className="text-or-1 font-medium">seta esquerda</span> para navegar entre os áudios.
            </p>
          </div>
        </div>

        {/* Item de instrução */}
        <div className="flex items-start gap-4 p-3 rounded-lg bg-bk-2/50 hover:bg-bk-2 transition-colors">
          <div className="bg-bk-1 p-3 rounded-lg border border-or-1/50 flex-shrink-0">
            <FaArrowRight className="text-or-1 text-sm" />
          </div>
          <div>
            <p className="text-gr-1">
              Use a <span className="text-or-1 font-medium">seta direita</span> para Play/Stop.
            </p>
          </div>
        </div>

        {/* Item de instrução */}
        <div className="flex items-start gap-4 p-3 rounded-lg bg-bk-2/50 hover:bg-bk-2 transition-colors">
          <div className="bg-bk-1 p-3 rounded-lg border border-or-1/50 flex-shrink-0">
            <MdOutlineScreenLockPortrait className="text-or-1 text-sm" />
          </div>
          <div>
            <p className="text-gr-1">
              Ative o <span className="text-or-1 font-medium">bloqueio de tela</span> no canto superior direito para manter a tela sempre visível.
            </p>
            <p className="text-gr-1">
              Depende do suporte do seu aparelho.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Info