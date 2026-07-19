import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/constants/app.constants";
import { THEME_MODES, type ThemeMode } from "@/constants/theme.constants";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: THEME_MODES.SYSTEM,
      setMode: (mode) => set({ mode }),
    }),
    {
      name: STORAGE_KEYS.THEME,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
