import { useThemeStore } from '@/lib/theme-store';
import { Colors } from '@/constants/theme';

export function useThemeColors() {
  const mode = useThemeStore((s) => s.mode);
  return Colors[mode];
}
