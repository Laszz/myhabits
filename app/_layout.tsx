import '../global.css';
import { View } from 'react-native';
import { useEffect } from 'react';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';

import { migrateDbIfNeeded } from '@/lib/database';
import { useThemeStore } from '@/lib/theme-store';
import { useLanguageStore } from '@/lib/language-store';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const paperLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#10B981',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    onBackground: '#000000',
    onSurface: '#000000',
    onSurfaceVariant: '#6B7280',
    outline: '#E5E7EB',
  },
};

const paperDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#10B981',
    background: '#000000',
    surface: '#111111',
    surfaceVariant: '#1A1A1A',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#9CA3AF',
    outline: '#262626',
  },
};

export default function RootLayout() {
  const mode = useThemeStore((s) => s.mode);
  const loadLanguage = useLanguageStore((s) => s.loadLanguage);
  const isDark = mode === 'dark';
  const colors = Colors[mode];

  useEffect(() => {
    loadLanguage();
    // Set Android system colors
    import('expo-navigation-bar').then((mod) => {
      mod.setBackgroundColorAsync?.(isDark ? '#000000' : '#FFFFFF');
      mod.setButtonStyleAsync?.(isDark ? 'light' : 'dark');
    }).catch(() => {});
    import('expo-system-ui').then((mod) => {
      mod.default?.setBackgroundColorAsync?.(isDark ? '#000000' : '#FFFFFF');
    }).catch(() => {});
    // Request notification permission
    import('@/lib/notifications').then((mod) => {
      mod.requestNotificationPermission();
    }).catch(() => {});
  }, [isDark]);

  const navTheme = {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: isDark ? '#000000' : '#FFFFFF',
      card: isDark ? '#111111' : '#FFFFFF',
      text: isDark ? '#FFFFFF' : '#000000',
      border: isDark ? '#262626' : '#E5E7EB',
      notification: colors.primary,
    },
    fonts: {
      regular: { fontFamily: 'normal', fontWeight: 'normal' as const },
      medium: { fontFamily: 'normal', fontWeight: '500' as const },
      bold: { fontFamily: 'normal', fontWeight: 'bold' as const },
      heavy: { fontFamily: 'normal', fontWeight: '900' as const },
    },
  };

  return (
    <SQLiteProvider databaseName="habits.db" onInit={migrateDbIfNeeded}>
      <PaperProvider theme={isDark ? paperDark : paperLight}>
        <ThemeProvider value={navTheme}>
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: isDark ? '#000000' : '#FFFFFF' },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="add-habit" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="edit-habit" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="habit-detail" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </ThemeProvider>
      </PaperProvider>
    </SQLiteProvider>
  );
}
