import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import { Heart, Brain, Zap, Dumbbell, Moon, Coins, BookOpen, Smile, Target } from 'lucide-react-native';
import { useHabitStore } from '@/lib/store';
import { ProgressRing } from '@/components/ProgressRing';
import { HabitCard } from '@/components/HabitCard';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTranslation } from '@/hooks/use-translation';

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  Health: Heart, Mind: Brain, Focus: Zap, Fitness: Dumbbell,
  Sleep: Moon, Finance: Coins, Learning: BookOpen, 'Self-Care': Smile, Productivity: Target,
};

function getDateString(): string {
  const now = new Date();
  const day = now.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
  return `${now.toLocaleDateString('en-US', { month: 'long' })} ${day}${suffix}, ${now.getFullYear()}`;
}

const SECTION_HEADER_H = 40;
const CARD_H = 130;
const PROGRESS_H = 260;

export default function HomeScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const habits = useHabitStore((s) => s.habits);
  const progress = useHabitStore((s) => s.progress);
  const refresh = useHabitStore((s) => s.refresh);
  const toggleCheckin = useHabitStore((s) => s.toggleCheckin);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useFocusEffect(
    useCallback(() => {
      refresh(db);
    }, [db, refresh])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh(db);
    setRefreshing(false);
  }, [db, refresh]);

  const handleToggle = useCallback((id: number) => toggleCheckin(db, id), [db, toggleCheckin]);
  const handleDelete = useCallback((id: number) => deleteHabit(db, id), [db, deleteHabit]);
  const handleEdit = useCallback((id: number) => router.push({ pathname: '/edit-habit', params: { id: String(id) } }), [router]);
  const handleDetail = useCallback((id: number) => router.push({ pathname: '/habit-detail', params: { id: String(id) } }), [router]);

  // Unique categories from habits
  const categories = useMemo(() => {
    const cats = new Set(habits.map((h) => h.category || 'Other'));
    return ['All', ...Array.from(cats)];
  }, [habits]);

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      All: t('all'), Health: t('health'), Mind: t('mind'), Focus: t('focus'),
      Fitness: t('fitness'), Sleep: t('sleep'), Finance: t('finance'),
      Learning: t('learning'), 'Self-Care': t('selfCare'), Productivity: t('productivity'),
      Other: t('other'),
    };
    return map[cat] || cat;
  };

  // Filter habits by selected category
  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'All') return habits;
    return habits.filter((h) => h.category === selectedCategory);
  }, [habits, selectedCategory]);

  // Group habits by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filteredHabits>();
    for (const h of filteredHabits) {
      const cat = h.category || 'Other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(h);
    }
    return Array.from(map.entries());
  }, [filteredHabits]);

  // Build flat data: { type: 'header', title } | { type: 'habit', habit }
  type ListItem =
    | { type: 'header'; title: string; key: string }
    | { type: 'habit'; habit: typeof habits[0]; key: string };

  const flatData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    for (const [category, catHabits] of grouped) {
      items.push({ type: 'header', title: category, key: `h-${category}` });
      for (const h of catHabits) {
        items.push({ type: 'habit', habit: h, key: `hab-${h.id}` });
      }
    }
    return items;
  }, [grouped]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return (
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.secondaryText, letterSpacing: 0.05, marginBottom: 8, marginTop: 16, paddingHorizontal: 20 }}>
          {getCategoryLabel(item.title).toUpperCase()}
        </Text>
      );
    }
    return (
      <HabitCard
        habit={item.habit}
        onToggle={() => handleToggle(item.habit.id)}
        onDelete={() => handleDelete(item.habit.id)}
        onEdit={() => handleEdit(item.habit.id)}
        onDetail={() => handleDetail(item.habit.id)}
      />
    );
  }, [handleToggle, handleDelete, handleEdit, handleDetail, colors, t]);

  const keyExtractor = useCallback((item: ListItem) => item.key, []);

  const getItemLayout = useCallback((_: any, index: number) => {
    if (index === 0) return { length: PROGRESS_H, offset: 0, index };
    const item = flatData[index - 1];
    const length = item.type === 'header' ? SECTION_HEADER_H : CARD_H;
    return { length, offset: PROGRESS_H + (index - 1) * (item.type === 'header' ? SECTION_HEADER_H : CARD_H) + (index > 1 ? SECTION_HEADER_H : 0), index };
  }, [flatData]);

  const progressMsg = t('progressMessage', progress.percentage);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={flatData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" colors={['#10B981']} />
        }
        ListHeaderComponent={
          <>
            {/* Top app bar */}
            <View style={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 16 }}>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text }}>{t('appTitle')}</Text>
              <Text style={{ fontSize: 14, color: colors.secondaryText, marginTop: 4 }}>{getDateString()}</Text>
            </View>

            {/* Progress card */}
            <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
              <View
                style={{
                  borderRadius: 20,
                  padding: 24,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 20,
                }}
              >
                <ProgressRing percentage={progress.percentage} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.secondaryText, marginBottom: 4 }}>
                    {t('todayProgress')}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                    {progressMsg}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.secondaryText, marginTop: 4 }}>
                    {t('habitsCompleted', progress.completed, progress.total)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Section title */}
            {habits.length > 0 && (
              <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{t('todayHabits')}</Text>
              </View>
            )}

            {/* Category filter chips */}
            {habits.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginBottom: 12 }}>
                {categories.map((cat) => {
                  const sel = selectedCategory === cat;
                  const CatIcon = CATEGORY_ICONS[cat];
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 6,
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                        backgroundColor: sel ? '#10B981' : colors.surface,
                        borderWidth: 1, borderColor: sel ? '#10B981' : colors.border,
                      }}
                    >
                      {CatIcon && <CatIcon size={16} color={sel ? '#FFFFFF' : colors.secondaryText} />}
                      <Text style={{ fontSize: 14, fontWeight: sel ? '600' : '400', color: sel ? '#FFFFFF' : colors.text }}>
                        {getCategoryLabel(cat)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </>
        }
      />

      {habits.length === 0 && <EmptyState />}

      <FAB onPress={() => router.push('/add-habit')} />
    </View>
  );
}
