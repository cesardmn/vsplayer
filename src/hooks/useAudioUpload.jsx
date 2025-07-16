import { WS } from '../services/waveurfer'
import { DB } from '../services/indexedDB'
import { usePlayer } from '../store/playerStore'

export const useAudioUpload = () => {
  const {
    fileList,
    setTotalFilesToProcess,
    setProcessedFilesCount,
    setIsProcessing,
    toggleInfoShow,
    setFileList,
  } = usePlayer()

  const processFiles = async (inputFiles) => {
    try {
      setTotalFilesToProcess(inputFiles.length)
      setProcessedFilesCount(0)
      setIsProcessing(true)
      toggleInfoShow(false)

      let processed = 0
      const updatedList = [...fileList]

      for (const file of inputFiles) {
        try {
          const { name, lastModified } = file
          const extension = name.split('.').pop().toLowerCase()
          let audioMeta = await DB.getAudioMeta(name)

          if (!audioMeta || audioMeta.lastModified !== lastModified) {
            await DB.deleteAudio(name)
            const peaks = await WS.getPeaks(file)
            await DB.saveAudio(name, { extension, lastModified, peaks }, file)
            audioMeta = await DB.getAudioMeta(name)
          }

          if (audioMeta) {
            const alreadyExists = updatedList.includes(audioMeta.name)
            if (!alreadyExists) {
              updatedList.push(audioMeta.name)
            }
          }

          processed++
          setProcessedFilesCount(processed)
        } catch (error) {
          console.error('Error processing file:', file.name, error)
        }
      }

      setFileList(updatedList)
    } catch (error) {
      console.error('Error in processFiles:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return { processFiles }
}
