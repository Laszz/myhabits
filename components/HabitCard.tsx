import React, { memo, useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Flame, Check, Droplet, BookOpen, Dumbbell, Trophy, Zap, Target, Heart, Moon, Leaf, Coins, Brush, PersonStanding, Footprints, Brain, Music, Camera, Coffee, Sun, Star, Shield, Gem, Lightbulb, Palette, Scissors, Pen, Mic, Timer, Apple, GlassWater, Smile, Gamepad2, Repeat, TrendingUp, Sparkles } from 'lucide-react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { type Habit, getCheckinsForHabit90Days } from '@/lib/database';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTranslation } from '@/hooks/use-translation';

interface HabitCardProps {
  habit: Habit & { streak: number; completedToday: boolean };
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onDetail: () => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Flame, Droplet, BookOpen, Dumbbell, Trophy, Zap, Target,
  Heart, Moon, Leaf, Coins, Brush, PersonStanding, Footprints, Brain,
  Music, Camera, Coffee, Sun, Star, Shield, Gem, Lightbulb, Palette,
  Scissors, Pen, Mic, Timer, Apple, GlassWater, Smile, Gamepad2,
  Repeat, TrendingUp, Sparkles, MoreHorizontal: Sparkles,
};

function getHeatColor(count: number, color: string): string {
  if (count === 0) return color + '35';
  if (count === 1) return color + 'AA';
  return color;
}

export const HabitCard = memo(function HabitCard({ habit, onToggle, onDelete, onEdit, onDetail }: HabitCardProps) {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const db = useSQLiteContext();
  const IconComponent = iconMap[habit.icon] || Flame;
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});

  useEffect(() => {
    getCheckinsForHabit90Days(db, habit.id).then(setHeatmap);
  }, [db, habit.id, habit.completedToday]);

  const { days, todayStr } = useMemo(() => {
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const y = now.getFullYear(), m = now.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const allDays: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      allDays.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return { days: allDays, todayStr: ts }; // tgl 1 kiri atas → kanan, stabil
  }, [heatmap]);

  const CELL = 10;
  const GAP = 2;

  const longPressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePressIn = () => {
    longPressTimer.current = setTimeout(() => {
      Alert.alert(habit.title, t('chooseAction'), [
        { text: t('cancel'), style: 'cancel' },
        { text: t('edit'), onPress: onEdit },
        { text: t('delete'), style: 'destructive', onPress: onDelete },
      ]);
    }, 500);
  };

  const handlePressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <View
      style={{
        borderRadius: 14,
        marginBottom: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
      }}
    >
      {/* Top row: icon, name, checkbox — tappable */}
      <Pressable
        onPress={onDetail}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        delayPressIn={0}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}
      >
        <View
          style={{
            width: 42, height: 42, borderRadius: 10,
            alignItems: 'center', justifyContent: 'center', marginRight: 12,
            backgroundColor: habit.color + '20',
          }}
        >
          <IconComponent size={22} color={habit.color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
            {habit.title}
          </Text>
          {habit.streak > 0 && (
            <Text style={{ fontSize: 12, fontWeight: '600', color: habit.color, marginTop: 2 }}>
              🔥 {t('dayStreak', habit.streak)}
            </Text>
          )}
        </View>

        <Pressable
          onPress={(e) => { e.stopPropagation(); onToggle(); }}
          style={{
            width: 42, height: 42, borderRadius: 10,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: habit.completedToday ? habit.color : colors.border,
            borderWidth: 1,
            borderColor: habit.completedToday ? habit.color : colors.secondaryText + '40',
          }}
        >
          {habit.completedToday && <Check size={24} color="#FFFFFF" strokeWidth={3} />}
        </Pressable>
      </Pressable>

      {/* Grid penuh row-major: atas-kiri → kanan, penuh → baris bawah */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: 12, paddingBottom: 12 }}>
        {days.map((dateStr) => {
          const isToday = dateStr === todayStr;
          const count = heatmap[dateStr] ?? 0;
          return (
            <View
              key={dateStr}
              style={{
                width: CELL, height: CELL, borderRadius: 2,
                backgroundColor: getHeatColor(count, habit.color),
                borderWidth: isToday ? 1.5 : 0,
                borderColor: isToday ? habit.color : 'transparent',
              }}
            />
          );
        })}
      </View>
    </View>
  );
});
