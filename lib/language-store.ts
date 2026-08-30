import { create } from 'zustand';
import AsyncStorage from 'expo-sqlite/kv-store';
import { type Language } from './i18n';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  loadLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: (AsyncStorage.getItemSync('language') as Language) || 'en',
  setLanguage: (lang: Language) => {
    AsyncStorage.setItemSync('language', lang);
    set({ language: lang });
  },
  loadLanguage: () => {
    const stored = AsyncStorage.getItemSync('language') as Language;
    if (stored === 'en' || stored === 'id') {
      set({ language: stored });
    }
  },
}));
