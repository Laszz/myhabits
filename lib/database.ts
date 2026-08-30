import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'habits.db';
const DATABASE_VERSION = 2;

export interface Habit {
  id: number;
  title: string;
  icon: string;
  color: string;
  category: string;
  frequency: string;
  is_active: number;
  created_at: string;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  date: string;
  completed: number;
  created_at: string;
}

export interface NewHabit {
  title: string;
  icon: string;
  color: string;
  category: string;
  frequency: string;
}

export interface Reminder {
  id: number;
  habit_id: number;
  time: string;
  enabled: number;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return SQLite.openDatabaseAsync(DATABASE_NAME);
}

export async function migrateDbIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'Flame',
        color TEXT NOT NULL DEFAULT '#10B981',
        category TEXT NOT NULL DEFAULT 'general',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS habit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL,
        time TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
      );
    `);
  }

  if (currentVersion < 2) {
    try {
      await db.execAsync(`ALTER TABLE habits ADD COLUMN frequency TEXT NOT NULL DEFAULT 'every_day'`);
    } catch {}
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

export async function getAllHabits(db: SQLite.SQLiteDatabase): Promise<Habit[]> {
  return db.getAllAsync<Habit>('SELECT * FROM habits WHERE is_active = 1 ORDER BY created_at DESC');
}

export async function getHabitsWithTodayStatus(db: SQLite.SQLiteDatabase, today: string): Promise<{ habit: Habit; completedToday: boolean }[]> {
  const habits = await getAllHabits(db);
  if (habits.length === 0) return [];

  const todayLogs = await db.getAllAsync<{ habit_id: number }>(
    'SELECT DISTINCT habit_id FROM habit_logs WHERE date = ? AND completed = 1',
    today
  );
  const completedSet = new Set(todayLogs.map((l) => l.habit_id));

  return habits.map((h) => ({ habit: h, completedToday: completedSet.has(h.id) }));
}

export async function getAllStreaks(db: SQLite.SQLiteDatabase): Promise<Record<number, number>> {
  const logs = await db.getAllAsync<{ habit_id: number; date: string }>(
    'SELECT habit_id, date FROM habit_logs WHERE completed = 1 ORDER BY habit_id, date DESC'
  );

  const streaks: Record<number, number> = {};
  const byHabit = new Map<number, string[]>();
  for (const log of logs) {
    if (!byHabit.has(log.habit_id)) byHabit.set(log.habit_id, []);
    byHabit.get(log.habit_id)!.push(log.date);
  }

  const today = getTodayString();
  for (const [habitId, dates] of byHabit) {
    let streak = 0;
    let checkDate = today;
    for (const d of dates) {
      if (d === checkDate) {
        streak++;
        checkDate = getPreviousDayString(checkDate);
      } else if (d < checkDate) {
        break;
      }
    }
    streaks[habitId] = streak;
  }

  return streaks;
}

export async function addHabit(db: SQLite.SQLiteDatabase, habit: NewHabit): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO habits (title, icon, color, category, frequency) VALUES (?, ?, ?, ?, ?)',
    habit.title,
    habit.icon,
    habit.color,
    habit.category,
    habit.frequency || 'every_day'
  );
  return result.lastInsertRowId;
}

export async function deleteHabit(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM habits WHERE id = ?', id);
}

export async function updateHabit(db: SQLite.SQLiteDatabase, id: number, habit: NewHabit): Promise<void> {
  await db.runAsync(
    'UPDATE habits SET title = ?, icon = ?, color = ?, category = ?, frequency = ? WHERE id = ?',
    habit.title,
    habit.icon,
    habit.color,
    habit.category,
    habit.frequency || 'every_day',
    id
  );
}

export async function addReminder(db: SQLite.SQLiteDatabase, habitId: number, time: string): Promise<number> {
  const result = await db.runAsync(
    'INSERT INTO reminders (habit_id, time, enabled) VALUES (?, ?, 1)',
    habitId,
    time
  );
  return result.lastInsertRowId;
}

export async function getRemindersForHabit(db: SQLite.SQLiteDatabase, habitId: number): Promise<Reminder[]> {
  return db.getAllAsync<Reminder>(
    'SELECT * FROM reminders WHERE habit_id = ? AND enabled = 1',
    habitId
  );
}

export async function deleteReminder(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM reminders WHERE id = ?', id);
}

export async function getCheckinsForDate(db: SQLite.SQLiteDatabase, date: string): Promise<HabitLog[]> {
  return db.getAllAsync<HabitLog>(
    'SELECT * FROM habit_logs WHERE date = ?',
    date
  );
}

export async function isHabitCompletedToday(db: SQLite.SQLiteDatabase, habitId: number, date: string): Promise<boolean> {
  const result = await db.getFirstAsync<HabitLog>(
    'SELECT * FROM habit_logs WHERE habit_id = ? AND date = ? AND completed = 1',
    habitId,
    date
  );
  return !!result;
}

export async function getLast7DaysCheckins(db: SQLite.SQLiteDatabase, habitId: number): Promise<boolean[]> {
  const result: boolean[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const log = await db.getFirstAsync<HabitLog>(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND date = ? AND completed = 1',
      habitId,
      dateStr
    );
    result.push(!!log);
  }
  return result;
}

export async function getGlobalStats(db: SQLite.SQLiteDatabase): Promise<{ currentStreak: number; bestStreak: number; totalCompletions: number }> {
  const totalResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habit_logs WHERE completed = 1'
  );
  const totalCompletions = totalResult?.count ?? 0;

  // Current streak: consecutive days with at least 1 completion
  let currentStreak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM habit_logs WHERE date = ? AND completed = 1',
      dateStr
    );
    if ((result?.count ?? 0) > 0) currentStreak++;
    else break;
  }

  // Best streak
  const allDates = await db.getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM habit_logs WHERE completed = 1 ORDER BY date ASC'
  );
  let bestStreak = 0;
  if (allDates.length > 0) {
    let tempStreak = 1;
    for (let i = 1; i < allDates.length; i++) {
      const prev = new Date(allDates[i - 1].date);
      const curr = new Date(allDates[i].date);
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diff === 1) { tempStreak++; }
      else { tempStreak = 1; }
      bestStreak = Math.max(bestStreak, tempStreak);
    }
    bestStreak = Math.max(bestStreak, tempStreak, currentStreak);
  }

  return { currentStreak, bestStreak, totalCompletions };
}

export async function getRecentCompletions(db: SQLite.SQLiteDatabase, limit: number = 10): Promise<{ date: string; time: string }[]> {
  const logs = await db.getAllAsync<HabitLog>(
    'SELECT * FROM habit_logs WHERE completed = 1 ORDER BY date DESC, created_at DESC LIMIT ?',
    limit
  );
  const seen = new Set<string>();
  const results: { date: string; time: string }[] = [];
  for (const log of logs) {
    if (seen.has(log.date)) continue;
    seen.add(log.date);
    const t = log.created_at ? new Date(log.created_at + 'Z') : null;
    const time = t ? t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '';
    results.push({ date: log.date, time });
    if (results.length >= limit) break;
  }
  return results;
}

export async function getCheckinsFor90Days(db: SQLite.SQLiteDatabase): Promise<Record<string, number>> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const startStr = `${ninetyDaysAgo.getFullYear()}-${String(ninetyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(ninetyDaysAgo.getDate()).padStart(2, '0')}`;
  const logs = await db.getAllAsync<{ date: string; count: number }>(
    'SELECT date, COUNT(*) as count FROM habit_logs WHERE date >= ? AND completed = 1 GROUP BY date',
    startStr
  );
  const map: Record<string, number> = {};
  for (const log of logs) map[log.date] = log.count;
  return map;
}

export async function getCheckinsForHabit90Days(db: SQLite.SQLiteDatabase, habitId: number): Promise<Record<string, number>> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const startStr = `${ninetyDaysAgo.getFullYear()}-${String(ninetyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(ninetyDaysAgo.getDate()).padStart(2, '0')}`;
  const logs = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM habit_logs WHERE habit_id = ? AND date >= ? AND completed = 1',
    habitId, startStr
  );
  const map: Record<string, number> = {};
  for (const log of logs) map[log.date] = (map[log.date] ?? 0) + 1;
  return map;
}

export async function getHabitStats(db: SQLite.SQLiteDatabase, habitId: number): Promise<{ totalCompletions: number; currentStreak: number; bestStreak: number }> {
  const totalResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habit_logs WHERE habit_id = ? AND completed = 1',
    habitId
  );
  const totalCompletions = totalResult?.count ?? 0;
  const currentStreak = await getStreak(db, habitId);
  const bestStreak = await getBestStreak(db, habitId);
  return { totalCompletions, currentStreak, bestStreak };
}

export async function toggleCheckin(db: SQLite.SQLiteDatabase, habitId: number, date: string): Promise<boolean> {
  // Clean up any duplicate entries first
  await db.runAsync(
    'DELETE FROM habit_logs WHERE habit_id = ? AND date = ? AND id NOT IN (SELECT MIN(id) FROM habit_logs WHERE habit_id = ? AND date = ? GROUP BY habit_id, date)',
    habitId, date, habitId, date
  );

  const existing = await db.getFirstAsync<HabitLog>(
    'SELECT * FROM habit_logs WHERE habit_id = ? AND date = ?',
    habitId,
    date
  );

  if (existing) {
    await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ? AND date = ?', habitId, date);
    return false;
  } else {
    await db.runAsync(
      'INSERT INTO habit_logs (habit_id, date, completed) VALUES (?, ?, 1)',
      habitId,
      date
    );
    return true;
  }
}

export async function getStreak(db: SQLite.SQLiteDatabase, habitId: number): Promise<number> {
  const today = getTodayString();
  let streak = 0;
  let currentDate = today;

  while (true) {
    const log = await db.getFirstAsync<HabitLog>(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND date = ? AND completed = 1',
      habitId,
      currentDate
    );

    if (!log) break;

    streak++;
    currentDate = getPreviousDayString(currentDate);
  }

  return streak;
}

export async function getTodayProgress(db: SQLite.SQLiteDatabase): Promise<{ total: number; completed: number; percentage: number }> {
  const today = getTodayString();
  const totalResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habits WHERE is_active = 1'
  );
  const completedResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(DISTINCT hl.habit_id) as count
     FROM habit_logs hl
     INNER JOIN habits h ON h.id = hl.habit_id
     WHERE hl.date = ? AND hl.completed = 1 AND h.is_active = 1`,
    today
  );

  const total = totalResult?.count ?? 0;
  const completed = completedResult?.count ?? 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, percentage };
}

export function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getPreviousDayString(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export async function getCheckinsForMonth(db: SQLite.SQLiteDatabase, year: number, month: number): Promise<Record<string, number>> {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

  const rows = await db.getAllAsync<{ date: string; count: number }>(
    `SELECT date, COUNT(*) as count FROM habit_logs
     WHERE date >= ? AND date <= ? AND completed = 1
     GROUP BY date`,
    startDate,
    endDate
  );

  const result: Record<string, number> = {};
  for (const row of rows) {
    result[row.date] = row.count;
  }
  return result;
}

export async function getBestStreak(db: SQLite.SQLiteDatabase, habitId: number): Promise<number> {
  const logs = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM habit_logs WHERE habit_id = ? AND completed = 1 ORDER BY date ASC',
    habitId
  );

  if (logs.length === 0) return 0;

  let bestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < logs.length; i++) {
    const prevDate = new Date(logs[i - 1].date);
    const currDate = new Date(logs[i].date);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return bestStreak;
}

export async function getOverallStats(db: SQLite.SQLiteDatabase): Promise<{
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
}> {
  const totalCompletionsResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habit_logs WHERE completed = 1'
  );

  const totalHabitsResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habits WHERE is_active = 1'
  );

  const today = getTodayString();
  const todayCompleted = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habit_logs WHERE date = ? AND completed = 1',
    today
  );

  // Calculate current overall streak (consecutive days with all habits completed)
  const totalHabits = totalHabitsResult?.count ?? 0;
  let overallStreak = 0;
  if (totalHabits > 0) {
    let checkDate = today;
    while (true) {
      const dayCompleted = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM habit_logs WHERE date = ? AND completed = 1',
        checkDate
      );
      if ((dayCompleted?.count ?? 0) < totalHabits) break;
      overallStreak++;
      checkDate = getPreviousDayString(checkDate);
    }
  }

  // Best overall streak
  const allDates = await db.getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM habit_logs WHERE completed = 1 ORDER BY date ASC'
  );

  let bestOverallStreak = 0;
  let tempStreak = 0;
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(allDates[i - 1].date);
      const currDate = new Date(allDates[i].date);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    bestOverallStreak = Math.max(bestOverallStreak, tempStreak);
  }

  // Completion rate (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;

  const totalPossible = totalHabits * 30;
  const totalDoneResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM habit_logs WHERE date >= ? AND completed = 1',
    thirtyDaysAgoStr
  );
  const completionRate = totalPossible > 0 ? Math.round(((totalDoneResult?.count ?? 0) / totalPossible) * 100) : 0;

  return {
    totalCompletions: totalCompletionsResult?.count ?? 0,
    currentStreak: overallStreak,
    bestStreak: bestOverallStreak,
    completionRate,
  };
}
