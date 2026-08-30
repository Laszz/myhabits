import { create } from 'zustand';
import AsyncStorage from 'expo-sqlite/kv-store';

type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: (AsyncStorage.getItemSync('theme-mode') as ThemeMode) || 'light',
  setMode: (mode: ThemeMode) => {
    AsyncStorage.setItemSync('theme-mode', mode);
    set({ mode });
  },
}));
