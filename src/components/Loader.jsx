import { usePlayer } from '../store/playerStore'

const Loader = () => {
  const { totalFilesToProcess, processedFilesCount, isProcessing } = usePlayer()

  if (!isProcessing) return null

  const percentage =
    totalFilesToProcess > 0
      ? Math.min(100, (processedFilesCount / totalFilesToProcess) * 100)
      : 0

  return (
    <div className="fixed inset-0 bg-bk-3 bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-bk-2 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-or-1 mb-4">
          Processando arquivos...
        </h3>

        <div className="mb-2 flex justify-between text-sm">
          <span>
            {processedFilesCount} de {totalFilesToProcess} arquivos processados
          </span>
          <span>{Math.round(percentage)}%</span>
        </div>

        <div className="w-full bg-bk-1 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-or-3 to-or-1 h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {percentage === 100 && (
          <p className="mt-3 text-sm text-gr-1 animate-pulse">Finalizando...</p>
        )}
      </div>
    </div>
  )
}

export default Loader
