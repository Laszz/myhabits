import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { Flame, Trophy, CheckCircle } from 'lucide-react-native';
import { getGlobalStats, getRecentCompletions, getCheckinsFor90Days } from '@/lib/database';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTranslation } from '@/hooks/use-translation';
import { getMonthLabel, getDayLabel } from '@/lib/i18n';

function formatLabel(dateStr: string, t: (key: any) => string, lang: 'en' | 'id'): string {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === today) return t('today');
  if (dateStr === yesterdayStr) return t('yesterday');
  const weekday = getDayLabel(lang, d.getDay());
  const month = getMonthLabel(lang, d.getMonth());
  const day = d.getDate();
  return lang === 'id' ? `${weekday}, ${day} ${month}` : `${weekday}, ${month} ${day}`;
}

function getHeatColor(count: number, colors: any): string {
  if (count === 0) return colors.border;
  if (count === 1) return colors.primary + '55';
  if (count === 2) return colors.primary + 'AA';
  return colors.primary;
}

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const { t, language } = useTranslation();
  const [stats, setStats] = useState({ currentStreak: 0, bestStreak: 0, totalCompletions: 0 });
  const [recent, setRecent] = useState<{ date: string; time: string }[]>([]);
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [s, r, h] = await Promise.all([
      getGlobalStats(db),
      getRecentCompletions(db, 10),
      getCheckinsFor90Days(db),
    ]);
    setStats(s);
    setRecent(r);
    setHeatmap(h);
  }, [db]);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Build 3 bulan terakhir per bulan — sesuai bulan, tgl 1 kiri atas row-major
  const now = new Date();
  const monthsData = [2, 1, 0].map((offset) => {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const y = d.getFullYear(), m = d.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const days: { date: string; count: number }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ date: dateStr, count: heatmap[dateStr] ?? 0 });
    }
    const label = `${getMonthLabel(language, m)} ${y}`;
    return { key: `${y}-${m}`, label, days };
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 48, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" colors={['#10B981']} />}
      >
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, paddingHorizontal: 20, marginBottom: 20 }}>{t('history')}</Text>

        {/* Hero Stats */}
        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16, alignItems: 'center' }}>
            <Flame size={24} color="#10B981" style={{ marginBottom: 4 }} />
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 }}>{stats.currentStreak}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryText, letterSpacing: 0.05 }}>{t('dayStreak', stats.currentStreak)}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16, alignItems: 'center' }}>
            <Trophy size={24} color="#005ac2" style={{ marginBottom: 4 }} />
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 }}>{stats.bestStreak}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryText, letterSpacing: 0.05 }}>{t('bestStreak')}</Text>
          </View>
        </View>
        <View style={{ marginHorizontal: 20, marginBottom: 24, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16, alignItems: 'center' }}>
          <CheckCircle size={24} color="#10B981" style={{ marginBottom: 4 }} />
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 }}>{stats.totalCompletions}</Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryText, letterSpacing: 0.05 }}>{t('totalCompletions')}</Text>
        </View>

        {/* Heatmap — 3 bulan per bulan, kotak kecil row-major penuh */}
        <View style={{ marginHorizontal: 20, marginBottom: 24, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>{t('last3Months')}</Text>
          {monthsData.map((m) => (
            <View key={m.key} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.secondaryText, marginBottom: 8 }}>{m.label}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {m.days.map((day) => (
                  <View
                    key={day.date}
                    style={{
                      width: 14, height: 14, borderRadius: 3,
                      backgroundColor: getHeatColor(day.count, colors),
                      borderWidth: day.date === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` ? 1 : 0,
                      borderColor: colors.primary,
                    }}
                  />
                ))}
              </View>
            </View>
          ))}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
            <Text style={{ fontSize: 11, color: colors.secondaryText }}>{t('less')}</Text>
            {[0, 1, 2, 3].map((level) => (
              <View key={level} style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: getHeatColor(level, colors) }} />
            ))}
            <Text style={{ fontSize: 11, color: colors.secondaryText }}>{t('more')}</Text>
          </View>
        </View>

        {/* Recent Completions */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>{t('recentCompletions')}</Text>
          <View style={{ gap: 10 }}>
            {recent.map((item, i) => (
              <View
                key={`${item.date}-${i}`}
                style={{
                  backgroundColor: colors.surface, borderRadius: 12,
                  borderWidth: 1, borderColor: colors.border,
                  padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12,
                }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#10B98120', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={18} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{formatLabel(item.date, t, language)}</Text>
                </View>
                <Text style={{ fontSize: 13, color: colors.secondaryText }}>{item.time}</Text>
              </View>
            ))}
            {recent.length === 0 && (
              <Text style={{ fontSize: 14, color: colors.secondaryText, textAlign: 'center', paddingVertical: 20 }}>{t('noCompletions')}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
