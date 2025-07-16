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
    setSelectedFile,
  } = usePlayer()

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

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
          let audioMeta = await DB.getAudioMeta(name)

          if (!audioMeta || audioMeta.lastModified !== lastModified) {
            await DB.deleteAudio(name)
            const { peaks, duration } = await WS.getMeta(file)
            await DB.saveAudio(name, { duration, lastModified, peaks }, file)
            audioMeta = await DB.getAudioMeta(name)
          }

          if (audioMeta) {
            console.log(audioMeta)
            const alreadyExists = updatedList.includes(audioMeta.name)
            if (!alreadyExists) {
              updatedList.push({
                name: audioMeta.name,
                duration: formatDuration(audioMeta.duration),
              })
            }
          }

          processed++
          setProcessedFilesCount(processed)
        } catch (error) {
          console.error('Error processing file:', file.name, error)
        }
      }

      setFileList(updatedList)
      if (updatedList.length > 0) {
        setSelectedFile(updatedList[0].name)
      }
    } catch (error) {
      console.error('Error in processFiles:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return { processFiles }
}
