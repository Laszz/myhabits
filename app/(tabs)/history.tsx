import React, { useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { Flame, Trophy, CheckCircle } from 'lucide-react-native';
import { getGlobalStats, getRecentCompletions, getCheckinsFor90Days } from '@/lib/database';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTranslation } from '@/hooks/use-translation';

function formatLabel(dateStr: string, t: (key: any) => string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === today) return t('today');
  if (dateStr === yesterdayStr) return t('yesterday');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getHeatColor(count: number): string {
  if (count === 0) return '#e2e7ff';
  if (count === 1) return '#a7f3d0';
  if (count === 2) return '#34d399';
  return '#10B981';
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
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
    // Auto-scroll heatmap to the right (latest dates)
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, [loadData]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Build heatmap: exactly 3 calendar months
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const allDays: { date: string; count: number }[] = [];
  const cursor = new Date(monthStart);
  while (cursor <= now) {
    const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    allDays.push({ date: dateStr, count: heatmap[dateStr] ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  // Pad start to align to Sunday
  const firstDow = new Date(allDays[0].date + 'T00:00:00').getDay();
  for (let i = 0; i < firstDow; i++) {
    allDays.unshift({ date: `pad-${i}`, count: -1 });
  }

  // Group into weeks
  const gridDays: { date: string; count: number }[][] = [];
  let week: { date: string; count: number }[] = [];
  for (const day of allDays) {
    week.push(day);
    if (week.length === 7) {
      gridDays.push(week);
      week = [];
    }
  }
  if (week.length > 0) gridDays.push(week);

  // Month labels
  const months: { label: string; startCol: number }[] = [];
  let lastMonth = -1;
  gridDays.forEach((w, i) => {
    const realDays = w.filter(d => !d.date.startsWith('pad'));
    if (realDays.length === 0) return;
    const m = new Date(realDays[0].date + 'T00:00:00').getMonth();
    if (m !== lastMonth) {
      months.push({ label: new Date(2024, m, 1).toLocaleDateString('en-US', { month: 'short' }), startCol: i });
      lastMonth = m;
    }
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

        {/* Heatmap */}
        <View style={{ marginHorizontal: 20, marginBottom: 24, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>{t('last3Months')}</Text>
          <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ marginRight: 6, gap: 5 }}>
                {DAY_LABELS.map((label, i) => (
                  <View key={i} style={{ width: 16, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryText }}>{label}</Text>
                  </View>
                ))}
              </View>
              <View>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  {gridDays.map((w, wi) => (
                    <View key={wi} style={{ gap: 5 }}>
                      {w.map((day) => (
                        <View
                          key={day.date}
                          style={{
                            width: 20, height: 20, borderRadius: 4,
                            backgroundColor: day.count === -1 ? 'transparent' : getHeatColor(day.count),
                          }}
                        />
                      ))}
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  {months.map((m, i) => {
                    const endCol = i < months.length - 1 ? months[i + 1].startCol : gridDays.length;
                    const w = (endCol - m.startCol) * 25 - 5;
                    return (
                      <Text key={i} style={{ fontSize: 13, fontWeight: '600', color: colors.secondaryText, width: w }}>
                        {m.label}
                      </Text>
                    );
                  })}
                </View>
              </View>
            </View>
          </ScrollView>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 6 }}>
            <Text style={{ fontSize: 11, color: colors.secondaryText }}>{t('less')}</Text>
            {[0, 1, 2, 3].map((level) => (
              <View key={level} style={{ width: 16, height: 16, borderRadius: 3, backgroundColor: getHeatColor(level) }} />
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
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{formatLabel(item.date, t)}</Text>
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
