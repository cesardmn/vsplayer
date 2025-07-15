import { create } from 'zustand'

export const usePlayer = create((set) => ({
  infoShow: true,
  toggleInfoShow: () => set((state) => ({ infoShow: !state.infoShow })),
}))
