import { useLanguageStore } from '@/lib/language-store';
import { t, type TranslationKeys } from '@/lib/i18n';

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  return {
    language,
    t: (key: TranslationKeys, ...args: any[]) => t(language, key, ...args),
  };
}
