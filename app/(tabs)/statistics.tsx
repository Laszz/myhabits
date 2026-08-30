import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { Flame, Trophy, CheckCircle2, BarChart3 } from 'lucide-react-native';
import { getOverallStats, getAllHabits, getStreak, getBestStreak } from '@/lib/database';
import type { Habit } from '@/lib/database';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTranslation } from '@/hooks/use-translation';

interface HabitWithStats extends Habit { currentStreak: number; bestStreak: number; }

export default function StatisticsScreen() {
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [stats, setStats] = useState({ totalCompletions: 0, currentStreak: 0, bestStreak: 0, completionRate: 0 });
  const [habitStats, setHabitStats] = useState<HabitWithStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setStats(await getOverallStats(db));
    const habits = await getAllHabits(db);
    setHabitStats(await Promise.all(habits.map(async (h) => ({
      ...h, currentStreak: await getStreak(db, h.id), bestStreak: await getBestStreak(db, h.id),
    }))));
  }, [db]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const card = (icon: React.ReactNode, value: string, label: string) => (
    <View style={{ width: '47%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 }}>
      {icon}
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginTop: 8 }}>{value}</Text>
      <Text style={{ fontSize: 14, color: colors.secondaryText }}>{label}</Text>
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: 48 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" colors={['#10B981']} />}
    >
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, paddingHorizontal: 20, marginBottom: 24 }}>{t('statistics')}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 24 }}>
        {card(<CheckCircle2 size={24} color="#10B981" />, String(stats.totalCompletions), t('totalCheckins'))}
        {card(<Flame size={24} color="#F97316" />, String(stats.currentStreak), t('currentStreak'))}
        {card(<Trophy size={24} color="#F59E0B" />, String(stats.bestStreak), t('bestStreak'))}
        {card(<BarChart3 size={24} color="#3B82F6" />, `${stats.completionRate}%`, t('completionRate'))}
      </View>

      {habitStats.length > 0 ? (
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 12 }}>{t('perHabit')}</Text>
          {habitStats.map((h) => (
            <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: h.color + '20' }}>
                <Flame size={20} color={h.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{h.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Flame size={12} color="#F97316" />
                    <Text style={{ fontSize: 12, color: '#F97316', marginLeft: 4 }}>{h.currentStreak}d</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Trophy size={12} color="#F59E0B" />
                    <Text style={{ fontSize: 12, color: '#F59E0B', marginLeft: 4 }}>{h.bestStreak}d</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 32 }}>
          <BarChart3 size={48} color="#64748B" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, textAlign: 'center', marginTop: 16, marginBottom: 8 }}>{t('noStatistics')}</Text>
          <Text style={{ fontSize: 16, color: colors.secondaryText, textAlign: 'center' }}>{t('noStatisticsDesc')}</Text>
        </View>
      )}
    </ScrollView>
  );
}
