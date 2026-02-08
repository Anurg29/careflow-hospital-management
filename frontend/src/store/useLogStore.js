import { create } from 'zustand';

export const useLogStore = create((set) => ({
  lines: ['Ready. Create or select a hospital, then connect.'],
  push: (text) =>
    set((state) => ({ lines: [...state.lines.slice(-199), `${new Date().toLocaleTimeString()}  ${text}`] })),
  clear: () => set({ lines: [] }),
}));
