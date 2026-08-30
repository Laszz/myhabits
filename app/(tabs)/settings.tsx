import React from 'react';
import { View, Text, Pressable, Alert, Linking } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Moon, Sun, Info, Trash2, Globe, Check } from 'lucide-react-native';
import { useThemeStore } from '@/lib/theme-store';
import { useLanguageStore } from '@/lib/language-store';
import { useHabitStore } from '@/lib/store';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTranslation } from '@/hooks/use-translation';
import { type Language } from '@/lib/i18n';

const LANGUAGES: { key: Language; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'id', label: 'Bahasa Indonesia' },
];

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const { mode, setMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const refresh = useHabitStore((s) => s.refresh);
  const { t } = useTranslation();

  const handleClearData = () => {
    Alert.alert(t('clearAllData'), t('clearAllDataDesc'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'), style: 'destructive',
        onPress: async () => {
          await db.execAsync('DELETE FROM habit_logs; DELETE FROM habits; DELETE FROM reminders;');
          await refresh(db);
          Alert.alert(t('done'), t('clearAllDataDone'));
        },
      },
    ]);
  };

  const themes: { key: 'light' | 'dark'; icon: React.ReactNode; label: string }[] = [
    { key: 'light', icon: <Sun size={20} color={mode === 'light' ? '#10B981' : '#64748B'} />, label: t('light') },
    { key: 'dark', icon: <Moon size={20} color={mode === 'dark' ? '#10B981' : '#64748B'} />, label: t('dark') },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 48 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, paddingHorizontal: 20, marginBottom: 24 }}>{t('settings')}</Text>

      <View style={{ paddingHorizontal: 20 }}>
        {/* Appearance */}
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.secondaryText, marginBottom: 12, textTransform: 'uppercase' }}>{t('appearance')}</Text>
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          {themes.map((th, i) => (
            <Pressable
              key={th.key}
              onPress={() => setMode(th.key)}
              style={{
                flexDirection: 'row', alignItems: 'center', padding: 16,
                borderBottomWidth: i < themes.length - 1 ? 1 : 0, borderBottomColor: colors.border,
              }}
            >
              {th.icon}
              <Text style={{ fontSize: 16, marginLeft: 12, color: mode === th.key ? '#10B981' : colors.text, fontWeight: mode === th.key ? '600' : 'normal' }}>
                {th.label}
              </Text>
              {mode === th.key && <View style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />}
            </Pressable>
          ))}
        </View>

        {/* Language */}
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.secondaryText, marginBottom: 12, textTransform: 'uppercase' }}>{t('language')}</Text>
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          {LANGUAGES.map((lang, i) => (
            <Pressable
              key={lang.key}
              onPress={() => setLanguage(lang.key)}
              style={{
                flexDirection: 'row', alignItems: 'center', padding: 16,
                borderBottomWidth: i < LANGUAGES.length - 1 ? 1 : 0, borderBottomColor: colors.border,
              }}
            >
              <Globe size={20} color={language === lang.key ? '#10B981' : '#64748B'} />
              <Text style={{ fontSize: 16, marginLeft: 12, color: language === lang.key ? '#10B981' : colors.text, fontWeight: language === lang.key ? '600' : 'normal' }}>
                {lang.label}
              </Text>
              {language === lang.key && <View style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />}
            </Pressable>
          ))}
        </View>

        {/* Data */}
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.secondaryText, marginBottom: 12, textTransform: 'uppercase' }}>{t('data')}</Text>
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
          <Pressable onPress={handleClearData} style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={{ fontSize: 16, color: '#EF4444', marginLeft: 12 }}>{t('clearAllData')}</Text>
          </Pressable>
        </View>

        {/* About */}
        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.secondaryText, marginBottom: 12, textTransform: 'uppercase' }}>{t('about')}</Text>
        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Info size={20} color="#64748B" />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 16, color: colors.text }}>MyHabits</Text>
              <Text style={{ fontSize: 14, color: colors.secondaryText }}>{t('version')}</Text>
            </View>
          </View>
          <Pressable onPress={() => Linking.openURL('https://github.com')} style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <Text style={{ fontSize: 16, color: '#10B981' }}>{t('visitGithub')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
