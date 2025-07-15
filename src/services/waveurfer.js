import WaveSurfer from 'wavesurfer.js'

export const WS = (() => {

  const getPeaks = async (file) => {
  const SAMPLE_COUNT = 1000
  const container = document.createElement('div')
  const ws = WaveSurfer.create({ container })

  const peaks = await new Promise((resolve) => {
    ws.loadBlob(file)
    ws.once('ready', () => {
      const exportedPeaks = ws.exportPeaks(SAMPLE_COUNT)
      ws.destroy()
      resolve(exportedPeaks)
    })
  })

  return peaks
}
  return {
    getPeaks,
  }

})()

