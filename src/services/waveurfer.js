import WaveSurfer from 'wavesurfer.js'

export const WS = (() => {
  const getMeta = async (file) => {
    const SAMPLE_COUNT = 1000
    const container = document.createElement('div')
    const ws = WaveSurfer.create({ container })

    return new Promise((resolve, reject) => {
      ws.loadBlob(file)
      ws.once('ready', () => {
        const duration = ws.getDuration()
        const peaks = ws.exportPeaks(SAMPLE_COUNT)
        ws.destroy()
        resolve({ duration, peaks })
      })
      ws.once('error', reject)
    })
  }

  return {
    getMeta,
  }
})()
