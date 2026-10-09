/**
 * OScope — Exhibition Mode Store
 * Manages presentation density, enlarged telemetry, and presentation controls
 * for academic vivas, project exhibitions, and teacher demonstrations.
 */

import { create } from 'zustand';

export interface ExhibitionStoreState {
  isExhibitionMode: boolean;
  toggleExhibitionMode: () => void;
  setExhibitionMode: (enabled: boolean) => void;
}

export const useExhibitionMode = create<ExhibitionStoreState>((set) => ({
  isExhibitionMode: false,
  toggleExhibitionMode: () =>
    set((state) => {
      const next = !state.isExhibitionMode;
      if (typeof document !== 'undefined') {
        if (next) {
          document.documentElement.classList.add('exhibition-mode');
        } else {
          document.documentElement.classList.remove('exhibition-mode');
        }
      }
      return { isExhibitionMode: next };
    }),
  setExhibitionMode: (enabled: boolean) => {
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.documentElement.classList.add('exhibition-mode');
      } else {
        document.documentElement.classList.remove('exhibition-mode');
      }
    }
    set({ isExhibitionMode: enabled });
  },
}));
