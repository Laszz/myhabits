import React, { useCallback, useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft, Edit3, Flame, Trophy, CheckCircle, ChevronLeft, ChevronRight,
  Droplet, Dumbbell, BookOpen, Moon, Leaf, Coins, Brush, PersonStanding,
  Footprints, Heart, Brain, Zap, Music, Camera, Coffee, Sun, Star,
  Target, Trophy as Award, Shield, Gem, Lightbulb, Palette, Scissors,
  Pen, Mic, Timer, Apple, GlassWater, Smile, Gamepad2, Repeat, TrendingUp, Sparkles,
} from 'lucide-react-native';
import { getCheckinsForHabit90Days, getHabitStats } from '@/lib/database';
import { useHabitStore } from '@/lib/store';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTranslation } from '@/hooks/use-translation';
import { getMonthLabel } from '@/lib/i18n';

const iconMap: Record<string, React.ComponentType<any>> = {
  Flame, Check: CheckCircle, Droplet, BookOpen, Dumbbell, Trophy: Award, Zap, Target,
  Heart, Moon, Leaf, Coins, Brush, PersonStanding, Footprints, MoreHorizontal: Sparkles, Brain,
  Music, Camera, Coffee, Sun, Star, Shield, Gem, Lightbulb, Palette, Scissors,
  Pen, Mic, Timer, Apple, GlassWater, Smile, Gamepad2, Repeat, TrendingUp, Sparkles,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function getHeatColor(count: number, color: string): string {
  if (count === 0) return color + '15';
  if (count === 1) return color + '60';
  return color;
}

export default function HabitDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const { t, language } = useTranslation();
  const habits = useHabitStore((s) => s.habits);
  const habitId = Number(id);
  const habit = habits.find((h) => h.id === habitId);

  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ totalCompletions: 0, currentStreak: 0, bestStreak: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const scrollRef = useRef<ScrollView>(null);
  const { width: screenWidth } = useWindowDimensions();

  const loadData = useCallback(async () => {
    if (!habitId) return;
    const [h, s] = await Promise.all([
      getCheckinsForHabit90Days(db, habitId),
      getHabitStats(db, habitId),
    ]);
    setHeatmap(h);
    setStats(s);
  }, [db, habitId]);

  useFocusEffect(useCallback(() => {
    loadData();
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, [loadData]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (!habit) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.secondaryText }}>{t('habitNotFound')}</Text>
      </View>
    );
  }

  const IconComp = iconMap[habit.icon] || Flame;

  // Build heatmap: 3 calendar months
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const allDays: { date: string; count: number }[] = [];
  const cursor = new Date(monthStart);
  while (cursor <= now) {
    const dateStr = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    allDays.push({ date: dateStr, count: heatmap[dateStr] ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  const firstDow = new Date(allDays[0].date + 'T00:00:00').getDay();
  for (let i = 0; i < firstDow; i++) {
    allDays.unshift({ date: `pad-${i}`, count: -1 });
  }
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }
  const cellSize = Math.floor((screenWidth - 80) / weeks.length) - 2;

  // Month labels for heatmap
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const realDay = week.find(d => !d.date.startsWith('pad-'));
    if (realDay) {
      const m = new Date(realDay.date + 'T00:00:00').getMonth();
      if (m !== lastMonth) {
        monthLabels.push({ label: getMonthLabel(language, m), weekIndex: wi });
        lastMonth = m;
      }
    }
  });

  // Calendar grid for selected month
  const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calFirstDow = new Date(calYear, calMonth, 1).getDay();
  const calCells: (number | null)[] = [];
  for (let i = 0; i < calFirstDow; i++) calCells.push(null);
  for (let d = 1; d <= calDaysInMonth; d++) calCells.push(d);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 48, paddingBottom: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{t('habitDetail')}</Text>
        <Pressable onPress={() => router.push({ pathname: '/edit-habit', params: { id: String(habitId) } })} style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
          <Edit3 size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" colors={['#10B981']} />}>
        {/* Habit Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: habit.color + '20', alignItems: 'center', justifyContent: 'center' }}>
            <IconComp size={28} color={habit.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{habit.title}</Text>
            <Text style={{ fontSize: 14, color: colors.secondaryText, marginTop: 2 }}>{t((habit.category?.toLowerCase() || 'other') as any)}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 }}>
          {[
            { icon: Flame, label: t('currentStreak'), value: `${stats.currentStreak}d`, color: '#F97316' },
            { icon: Trophy, label: t('bestStreak'), value: `${stats.bestStreak}d`, color: '#EAB308' },
            { icon: CheckCircle, label: t('totalDone'), value: String(stats.totalCompletions), color: '#10B981' },
          ].map((s) => (
            <View key={s.label} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
              <s.icon size={20} color={s.color} />
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 6 }}>{s.value}</Text>
              <Text style={{ fontSize: 11, color: colors.secondaryText, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Calendar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.secondaryText, marginBottom: 12 }}>{t('calendar')}</Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            {/* Month nav */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Pressable onPress={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else { setCalMonth(calMonth - 1); } }} style={{ padding: 8 }}>
                <ChevronLeft size={20} color={colors.text} />
              </Pressable>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{getMonthLabel(language, calMonth)} {calYear}</Text>
              <Pressable onPress={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else { setCalMonth(calMonth + 1); } }} style={{ padding: 8 }}>
                <ChevronRight size={20} color={colors.text} />
              </Pressable>
            </View>
            {/* Day headers */}
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              {[t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')].map((d) => (
                <Text key={d} style={{ width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, fontWeight: '600', color: colors.secondaryText }}>{d}</Text>
              ))}
            </View>
            {/* Days */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {calCells.map((day, i) => {
                if (day === null) return <View key={`e-${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const checked = (heatmap[dateStr] ?? 0) > 0;
                const isToday = dateStr === todayStr;
                return (
                  <View key={`d-${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: checked ? habit.color : 'transparent',
                      borderWidth: isToday ? 2 : 0,
                      borderColor: isToday ? habit.color : 'transparent',
                    }}>
                      <Text style={{ fontSize: 14, fontWeight: isToday ? '700' : '400', color: checked ? '#FFFFFF' : colors.text }}>{day}</Text>
                    </View>
                    {checked && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: habit.color, marginTop: 2 }} />}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
