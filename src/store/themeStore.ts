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
      // Light is the default on first open; dark is opt-in from Profile.
      mode: THEME_MODES.LIGHT,
      setMode: (mode) => set({ mode }),
    }),
    {
      name: STORAGE_KEYS.THEME,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // v0 defaulted to "system", which showed dark to anyone whose OS was dark.
      migrate: (state, version) => {
        const persisted = state as ThemeState | undefined;
        if (version === 0 && persisted?.mode === THEME_MODES.SYSTEM) {
          return { ...persisted, mode: THEME_MODES.LIGHT };
        }
        return persisted as ThemeState;
      },
    },
  ),
);
