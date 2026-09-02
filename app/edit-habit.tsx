import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import {
  ArrowLeft, Droplet, Dumbbell, BookOpen, Moon, Leaf, Coins, Brush,
  PersonStanding, Footprints, Heart, Brain, Zap,
  Check, Calendar, Clock, Music, Camera, Coffee, Sun, Star,
  Target, Trophy, Flame, Shield, Gem, Lightbulb, Palette, Scissors,
  Pen, Mic, Timer, Apple, GlassWater,
  Smile, Gamepad2, Repeat, TrendingUp, Sparkles,
} from 'lucide-react-native';
import { useHabitStore } from '@/lib/store';
import { addReminder, getRemindersForHabit, deleteReminder } from '@/lib/database';
import { scheduleHabitReminder, cancelAllReminders } from '@/lib/notifications';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTranslation } from '@/hooks/use-translation';

const ICONS = [
  { name: 'Droplet', component: Droplet },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Moon', component: Moon },
  { name: 'Leaf', component: Leaf },
  { name: 'Coins', component: Coins },
  { name: 'Brush', component: Brush },
  { name: 'PersonStanding', component: PersonStanding },
  { name: 'Footprints', component: Footprints },
  { name: 'Heart', component: Heart },
  { name: 'Brain', component: Brain },
  { name: 'Zap', component: Zap },
  { name: 'Music', component: Music },
  { name: 'Camera', component: Camera },
  { name: 'Coffee', component: Coffee },
  { name: 'Sun', component: Sun },
  { name: 'Star', component: Star },
  { name: 'Target', component: Target },
  { name: 'Trophy', component: Trophy },
  { name: 'Flame', component: Flame },
  { name: 'Shield', component: Shield },
  { name: 'Gem', component: Gem },
  { name: 'Lightbulb', component: Lightbulb },
  { name: 'Palette', component: Palette },
  { name: 'Scissors', component: Scissors },
  { name: 'Pen', component: Pen },
  { name: 'Mic', component: Mic },
  { name: 'Timer', component: Timer },
  { name: 'Apple', component: Apple },
  { name: 'GlassWater', component: GlassWater },
  { name: 'Smile', component: Smile },
  { name: 'Gamepad2', component: Gamepad2 },
  { name: 'Repeat', component: Repeat },
  { name: 'TrendingUp', component: TrendingUp },
  { name: 'Sparkles', component: Sparkles },
];

const COLORS = [
  { name: 'Green', value: '#10B981', ring: '#006c49' },
  { name: 'Orange', value: '#F97316', ring: '#9d4300' },
  { name: 'Blue', value: '#3B82F6', ring: '#005ac2' },
  { name: 'Mint', value: '#6FFBBE', ring: '#006c49' },
  { name: 'Red', value: '#EF4444', ring: '#ba1a1a' },
  { name: 'Purple', value: '#A855F7', ring: '#6b21a8' },
  { name: 'Yellow', value: '#EAB308', ring: '#854d0e' },
  { name: 'Pink', value: '#EC4899', ring: '#9d174d' },
  { name: 'Teal', value: '#14B8A6', ring: '#0f766e' },
  { name: 'Indigo', value: '#6366F1', ring: '#3730a3' },
];

const CATEGORIES = [
  { name: 'Health', icon: Heart },
  { name: 'Mind', icon: Brain },
  { name: 'Focus', icon: Zap },
  { name: 'Fitness', icon: Dumbbell },
  { name: 'Sleep', icon: Moon },
  { name: 'Finance', icon: Coins },
  { name: 'Learning', icon: BookOpen },
  { name: 'Self-Care', icon: Smile },
  { name: 'Productivity', icon: Target },
];

const FREQUENCIES = [
  { key: 'every_day', label: 'Every Day' },
  { key: 'weekdays', label: 'Weekdays' },
  { key: 'weekends', label: 'Weekends' },
  { key: 'custom', label: 'Custom' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export default function EditHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { habits, updateHabit } = useHabitStore();
  const habitId = Number(id);

  const habit = habits.find((h) => h.id === habitId);

  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Droplet');
  const [selectedColor, setSelectedColor] = useState('#10B981');
  const [selectedCategory, setSelectedCategory] = useState('Health');
  const [frequency, setFrequency] = useState('every_day');
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(8);
  const [reminderMinute, setReminderMinute] = useState(0);
  const [reminderPeriod, setReminderPeriod] = useState<'AM' | 'PM'>('AM');
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setSelectedIcon(habit.icon);
      setSelectedColor(habit.color);
      setSelectedCategory(habit.category);
      const freq = habit.frequency || 'every_day';
      if (freq.startsWith('custom:')) {
        setFrequency('custom');
        setCustomDays(freq.replace('custom:', '').split(','));
      } else {
        setFrequency(freq);
      }
      // Load existing reminder
      getRemindersForHabit(db, habitId).then((reminders) => {
        if (reminders.length > 0) {
          const r = reminders[0];
          setReminderEnabled(true);
          // Parse time string like "8:00 AM"
          const match = r.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (match) {
            setReminderHour(Number(match[1]));
            setReminderMinute(Number(match[2]));
            setReminderPeriod(match[3].toUpperCase() as 'AM' | 'PM');
          }
        }
      });
    }
  }, [habit]);

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      Health: t('health'), Mind: t('mind'), Focus: t('focus'),
      Fitness: t('fitness'), Sleep: t('sleep'), Finance: t('finance'),
      Learning: t('learning'), 'Self-Care': t('selfCare'), Productivity: t('productivity'),
    };
    return map[cat] || cat;
  };

  const toggleCustomDay = (day: string) => {
    setCustomDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const formatTime = (h: number, m: number, p: string) => {
    return `${h}:${String(m).padStart(2, '0')} ${p}`;
  };

  const getFrequencyLabel = () => {
    const map: Record<string, string> = {
      every_day: t('everyDay'), weekdays: t('weekdays'), weekends: t('weekends'), custom: t('custom'),
    };
    if (frequency === 'custom' && customDays.length > 0) {
      return customDays.join(', ');
    }
    return map[frequency] || t('everyDay');
  };

  const getDayLabel = (day: string) => {
    const map: Record<string, string> = {
      Mon: t('mon'), Tue: t('tue'), Wed: t('wed'), Thu: t('thu'), Fri: t('fri'), Sat: t('sat'), Sun: t('sun'),
    };
    return map[day] || day;
  };

  if (!habit) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.secondaryText }}>{t('habitNotFound')}</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (title.trim().length < 2) {
      Alert.alert(t('error'), t('habitNameError'));
      return;
    }
    const freqValue = frequency === 'custom' && customDays.length > 0
      ? `custom:${customDays.join(',')}`
      : frequency;
    await updateHabit(db, habitId, {
      title: title.trim(),
      icon: selectedIcon,
      color: selectedColor,
      category: selectedCategory,
      frequency: freqValue,
    });
    // Delete old reminders + cancel old notifications
    const oldReminders = await getRemindersForHabit(db, habitId);
    for (const r of oldReminders) {
      await deleteReminder(db, r.id);
    }
    await cancelAllReminders();
    // Schedule new reminder
    if (reminderEnabled) {
      const timeStr = formatTime(reminderHour, reminderMinute, reminderPeriod);
      await addReminder(db, habitId, timeStr);
      await scheduleHabitReminder(habitId, title.trim(), timeStr);
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 20, paddingTop: 48, paddingBottom: 16,
          backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{t('editHabit')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Habit Name */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryText, letterSpacing: 0.05, marginBottom: 8, textTransform: 'uppercase' }}>
            {t('habitName')}
          </Text>
          <TextInput
            style={{
              borderBottomWidth: 2, borderBottomColor: colors.border,
              paddingHorizontal: 4, paddingVertical: 12,
              fontSize: 18, fontWeight: '500', color: colors.text,
            }}
            placeholder={t('habitNamePlaceholder')}
            placeholderTextColor={colors.secondaryText + '99'}
            value={title} onChangeText={setTitle}
          />
        </View>

        {/* Category */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryText, letterSpacing: 0.05, marginBottom: 12, textTransform: 'uppercase' }}>
            {t('category')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              const sel = selectedCategory === cat.name;
              return (
                <Pressable key={cat.name} onPress={() => setSelectedCategory(cat.name)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                    borderWidth: 1, borderColor: sel ? '#10B981' : colors.border,
                    backgroundColor: sel ? '#10B981' + '10' : colors.surface,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <CatIcon size={20} color={sel ? '#10B981' : colors.secondaryText} />
                    <Text style={{ fontSize: 16, color: sel ? colors.text : colors.secondaryText, fontWeight: sel ? '500' : '400' }}>
                      {getCategoryLabel(cat.name)}                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Icon */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryText, letterSpacing: 0.05, marginBottom: 12, textTransform: 'uppercase' }}>
            {t('icon')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: colors.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
            {ICONS.map((icon) => {
              const IconComp = icon.component;
              const sel = selectedIcon === icon.name;
              return (
                <Pressable key={icon.name} onPress={() => setSelectedIcon(icon.name)}
                  style={{
                    width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: sel ? '#10B981' : colors.surfaceSoft,
                  }}
                >
                  <IconComp size={24} color={sel ? '#FFFFFF' : colors.secondaryText} />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Color Picker */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryText, letterSpacing: 0.05, marginBottom: 12, textTransform: 'uppercase' }}>
            {t('accentColor')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, backgroundColor: colors.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
            {COLORS.map((color) => {
              const sel = selectedColor === color.value;
              return (
                <Pressable key={color.value} onPress={() => setSelectedColor(color.value)}
                  style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: color.value,
                    borderWidth: sel ? 2 : 0,
                    borderColor: sel ? color.ring : 'transparent',
                    transform: [{ scale: sel ? 1.1 : 1 }],
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* Schedule */}
        <View>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryText, letterSpacing: 0.05, marginBottom: 12, textTransform: 'uppercase' }}>
            {t('schedule')}
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
            {/* Frequency */}
            <Pressable
              onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={20} color={colors.secondaryText} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{t('frequency')}</Text>
                  <Text style={{ fontSize: 14, color: colors.secondaryText }}>{getFrequencyLabel()}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 20, color: colors.secondaryText }}>{showFrequencyPicker ? '−' : '+'}</Text>
            </Pressable>

            {showFrequencyPicker && (
              <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8 }}>
                {FREQUENCIES.map((f) => (
                  <Pressable
                    key={f.key}
                    onPress={() => setFrequency(f.key)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10,
                      backgroundColor: frequency === f.key ? '#10B981' + '15' : colors.surfaceSoft,
                      borderWidth: 1, borderColor: frequency === f.key ? '#10B981' : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 16, color: colors.text, fontWeight: frequency === f.key ? '600' : '400' }}>
                      {t(f.key === 'every_day' ? 'everyDay' : f.key === 'weekdays' ? 'weekdays' : f.key === 'weekends' ? 'weekends' : 'custom')}
                    </Text>
                    {frequency === f.key && <Check size={18} color="#10B981" />}
                  </Pressable>
                ))}
                {frequency === 'custom' && (
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {DAYS.map((day) => (
                      <Pressable
                        key={day}
                        onPress={() => toggleCustomDay(day)}
                        style={{
                          width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
                          backgroundColor: customDays.includes(day) ? '#10B981' : colors.surfaceSoft,
                          borderWidth: 1, borderColor: customDays.includes(day) ? '#10B981' : colors.border,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: customDays.includes(day) ? '#FFFFFF' : colors.secondaryText }}>
                          {getDayLabel(day)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Reminder Toggle */}
            <Pressable
              onPress={() => setReminderEnabled(!reminderEnabled)}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} color={colors.secondaryText} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{t('reminder')}</Text>
                  <Text style={{ fontSize: 14, color: colors.secondaryText }}>{reminderEnabled ? formatTime(reminderHour, reminderMinute, reminderPeriod) : t('off')}</Text>
                </View>
              </View>
              <View style={{
                width: 48, height: 28, borderRadius: 14,
                backgroundColor: reminderEnabled ? '#10B981' : colors.surfaceSoft,
                justifyContent: 'center', paddingHorizontal: 3,
              }}>
                <View style={{
                  width: 22, height: 22, borderRadius: 11,
                  backgroundColor: '#FFFFFF',
                  alignSelf: reminderEnabled ? 'flex-end' : 'flex-start',
                }} />
              </View>
            </Pressable>

            {reminderEnabled && (
              <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondaryText, marginBottom: 12, textTransform: 'uppercase' }}>
                  {t('pickTime')}
                </Text>
                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 11, color: colors.secondaryText, textAlign: 'center', marginBottom: 4 }}>{t('hour')}</Text>
                    <ScrollView style={{ height: 120 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      {HOURS.map((h) => (
                        <Pressable
                          key={h}
                          onPress={() => setReminderHour(h)}
                          style={{
                            paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginBottom: 4,
                            backgroundColor: reminderHour === h ? '#10B981' : colors.surfaceSoft,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 16, fontWeight: reminderHour === h ? '700' : '400', color: reminderHour === h ? '#FFFFFF' : colors.text }}>
                            {h}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>:</Text>
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 11, color: colors.secondaryText, textAlign: 'center', marginBottom: 4 }}>{t('min')}</Text>
                    <ScrollView style={{ height: 150 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      {MINUTES.map((m) => (
                        <Pressable
                          key={m}
                          onPress={() => setReminderMinute(Number(m))}
                          style={{
                            paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginBottom: 4,
                            backgroundColor: reminderMinute === Number(m) ? '#10B981' : colors.surfaceSoft,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 16, fontWeight: reminderMinute === Number(m) ? '700' : '400', color: reminderMinute === Number(m) ? '#FFFFFF' : colors.text }}>
                            {m}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 11, color: colors.secondaryText, textAlign: 'center', marginBottom: 4 }}>{t('period')}</Text>
                    {(['AM', 'PM'] as const).map((p) => (
                      <Pressable
                        key={p}
                        onPress={() => setReminderPeriod(p)}
                        style={{
                          paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8,
                          backgroundColor: reminderPeriod === p ? '#10B981' : colors.surfaceSoft,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: reminderPeriod === p ? '700' : '400', color: reminderPeriod === p ? '#FFFFFF' : colors.text }}>
                          {p}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface + 'CC', borderTopWidth: 1, borderTopColor: colors.border, padding: 20 }}>
        <Pressable onPress={handleSave}
          style={{ backgroundColor: '#10B981', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#006c49', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 5 }}
        >
          <Check size={20} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>{t('save')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
