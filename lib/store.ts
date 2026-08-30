import { create } from 'zustand';
import { type SQLiteDatabase } from 'expo-sqlite';
import {
  addHabit as dbAddHabit,
  deleteHabit as dbDeleteHabit,
  updateHabit as dbUpdateHabit,
  toggleCheckin as dbToggleCheckin,
  getTodayProgress,
  getTodayString,
  getHabitsWithTodayStatus,
  getAllStreaks,
  type Habit,
  type NewHabit,
} from './database';

export interface HabitWithStreak extends Habit {
  streak: number;
  completedToday: boolean;
}

export interface ProgressData {
  total: number;
  completed: number;
  percentage: number;
}

interface HabitStore {
  habits: HabitWithStreak[];
  progress: ProgressData;
  isLoaded: boolean;
  refresh: (db: SQLiteDatabase) => Promise<void>;
  toggleCheckin: (db: SQLiteDatabase, habitId: number) => Promise<void>;
  addHabit: (db: SQLiteDatabase, habit: NewHabit) => Promise<number>;
  updateHabit: (db: SQLiteDatabase, id: number, habit: NewHabit) => Promise<void>;
  deleteHabit: (db: SQLiteDatabase, id: number) => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  progress: { total: 0, completed: 0, percentage: 0 },
  isLoaded: false,

  refresh: async (db: SQLiteDatabase) => {
    const today = getTodayString();
    const statusList = await getHabitsWithTodayStatus(db, today);
    const progress = await getTodayProgress(db);
    const streaks = await getAllStreaks(db);

    const habitsWithStreak: HabitWithStreak[] = statusList.map(({ habit, completedToday }) => ({
      ...habit,
      streak: streaks[habit.id] ?? 0,
      completedToday,
    }));

    set({ habits: habitsWithStreak, progress, isLoaded: true });
  },

  toggleCheckin: async (db: SQLiteDatabase, habitId: number) => {
    const today = getTodayString();
    await dbToggleCheckin(db, habitId, today);
    await get().refresh(db);
  },

  addHabit: async (db: SQLiteDatabase, habit: NewHabit) => {
    const id = await dbAddHabit(db, habit);
    await get().refresh(db);
    return id;
  },

  updateHabit: async (db: SQLiteDatabase, id: number, habit: NewHabit) => {
    await dbUpdateHabit(db, id, habit);
    await get().refresh(db);
  },

  deleteHabit: async (db: SQLiteDatabase, id: number) => {
    await dbDeleteHabit(db, id);
    await get().refresh(db);
  },
}));
