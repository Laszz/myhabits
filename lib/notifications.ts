import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';
import { openSettings } from 'expo-linking';
import type * as SQLite from 'expo-sqlite';
import {
  getRemindersWithoutNotifId,
  getAllEnabledReminders,
  updateReminderNotificationId,
} from './database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
        lightColor: '#10B981',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      });
    }
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync({
      android: {},
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    } as any);
    return status === 'granted';
  } catch {
    return false;
  }
}

// ponytail: expo-notifications TIDAK punya JS API buat cek/minta exact alarm.
// Tanpa izin ini (mati default di HyperOS utk app baru), alarm jatuh ke inexact →
// telat/nggak bunyi TANPA error apa pun. Satu-satunya jalan: deep-link user ke layarnya.
export async function openExactAlarmSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const pkg = Constants.expoConfig?.android?.package ?? 'com.naufaln.myhabits';
    await IntentLauncher.startActivityAsync('android.settings.REQUEST_SCHEDULE_EXACT_ALARM', {
      data: `package:${pkg}`,
    });
  } catch {
    try { await openSettings(); } catch {}
  }
}

// ponytail: manifest doang nggak cukup — whitelist battery harus diminta via intent,
// kalau nggak: saver ON = alarm inexact di-defer berjam-jam walau Autostart ON.
export async function openBatteryOptimizationSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const pkg = Constants.expoConfig?.android?.package ?? 'com.naufaln.myhabits';
    await IntentLauncher.startActivityAsync('android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS', {
      data: `package:${pkg}`,
    });
  } catch {
    try { await openSettings(); } catch {}
  }
}

export async function getScheduledCount(): Promise<number> {
  try {
    const list = await Notifications.getAllScheduledNotificationsAsync();
    return list.length;
  } catch { return 0; }
}

// ponytail: parse "14:39" (24h) + legacy "2:39 PM" → { hours, minutes }
export function parseReminderTime(time: string): { hours: number; minutes: number } {
  const [timePart, period] = time.trim().split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  if (period) {
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  return { hours, minutes };
}

export function formatReminderTime24(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export async function scheduleHabitReminder(
  habitId: number,
  habitTitle: string,
  time: string
): Promise<string | null> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.warn('[notif] permission denied, skip schedule');
      return null;
    }

    const { hours, minutes } = parseReminderTime(time);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      console.warn('[notif] invalid time:', time);
      return null;
    }

    // DAILY spec SDK54: { type, hour, minute, channelId? } — tanpa repeats
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pengingat Habit',
        body: `Jangan lupa: ${habitTitle}`,
        data: { habitId },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        color: '#10B981',
        vibrate: [0, 250, 250, 250],
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        channelId: 'reminders',
      },
    });

    return id;
  } catch (e) {
    console.warn('[notif] schedule failed:', e);
    return null;
  }
}

// ponytail: test helper — notif 10 detik buat verifikasi channel/bunyi tanpa nunggu jam daily
export async function scheduleTestNotification(): Promise<string | null> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Tes Notifikasi',
        body: 'Kalau ini muncul, channel + bunyi OK. Tinggal cek jadwal daily.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        color: '#10B981',
        vibrate: [0, 250, 250, 250],
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 10,
        channelId: 'reminders',
      },
    });
  } catch (e) {
    console.warn('[notif] test schedule failed:', e);
    return null;
  }
}

export async function cancelReminder(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

// ponytail: sekali jalan — bersihin ghost/duplikat legacy (tanpa notification_id).
// cancelAll HAPUS SEMUA alarm (termasuk yg valid!) → WAJIB jadwal ulang SEMUA yg enabled.
// Cek izin dulu TANPA dialog; yg gagal schedule = NULL biar dicoba lagi next launch.
let repairing = false; // ponytail: lock — focus ganda = repair dobel = alarm ke-wipe
export async function repairOrphanedReminders(db: SQLite.SQLiteDatabase): Promise<void> {
  if (repairing) return;
  repairing = true;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;
    const orphans = await getRemindersWithoutNotifId(db);
    if (orphans.length === 0) return;
    const all = await getAllEnabledReminders(db);
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const r of all) {
      const { hours, minutes } = parseReminderTime(r.time);
      if (!Number.isFinite(hours) || !Number.isFinite(minutes)) continue;
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Pengingat Habit',
            body: `Jangan lupa: ${r.title}`,
            data: { habitId: r.habit_id },
            sound: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            color: '#10B981',
            vibrate: [0, 250, 250, 250],
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: hours,
            minute: minutes,
            channelId: 'reminders',
          },
        });
        await updateReminderNotificationId(db, r.id, id);
      } catch {
        await updateReminderNotificationId(db, r.id, null);
      }
    }
  } catch {} finally {
    repairing = false;
  }
}
