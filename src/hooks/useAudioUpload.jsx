import { WS } from '../services/waveurfer'
import { DB } from '../services/indexedDB'
import { usePlayer } from '../store/playerStore'

export const useAudioUpload = () => {
  const {
    setTotalFilesToProcess,
    setProcessedFilesCount,
    setIsProcessing,
    toggleInfoShow,
  } = usePlayer()

  const processFiles = async (inputFiles) => {
    try {
      setTotalFilesToProcess(inputFiles.length)
      setProcessedFilesCount(0)
      setIsProcessing(true)

      toggleInfoShow(false)

      let processed = 0

      for (const file of inputFiles) {
        try {
          const { name, lastModified } = file
          const extension = name.split('.').pop().toLowerCase()
          const audioMeta = await DB.getAudioMeta(name)

          if (!audioMeta || audioMeta.lastModified !== lastModified) {
            await DB.deleteAudio(name)
            const peaks = await WS.getPeaks(file)
            await DB.saveAudio(name, { extension, lastModified, peaks }, file)
          }

          processed++
          setProcessedFilesCount(processed)
        } catch (error) {
          console.error('Error processing file:', file.name, error)
        }
      }
    } catch (error) {
      console.error('Error in processFiles:', error)
    } finally {
      setIsProcessing(false)

    }
  }

  return { processFiles }
}
