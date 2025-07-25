import { create } from 'zustand'

export const usePlayer = create((set) => ({
  infoShow: true,
  toggleInfoShow: () => set((state) => ({ infoShow: !state.infoShow })),

  totalFilesToProcess: 0,
  setTotalFilesToProcess: (count) => set({ totalFilesToProcess: count }),
  processedFilesCount: 0,
  setProcessedFilesCount: (count) => set({ processedFilesCount: count }),
  isProcessing: false,
  setIsProcessing: (isProcessing) => set({ isProcessing }),

  fileList: [],
  setFileList: (fileList) => set({ fileList }),

  selectedFile: '',
  setSelectedFile: (file) => set({ selectedFile: file }),

  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
}))
