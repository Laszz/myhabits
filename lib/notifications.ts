import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

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
        importance: Notifications.AndroidImportance.HIGH,
        sound: true,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
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

export async function getScheduledCount(): Promise<number> {
  try {
    const list = await Notifications.getAllScheduledNotificationsAsync();
    return list.length;
  } catch { return 0; }
}

export async function scheduleHabitReminder(
  habitId: number,
  habitTitle: string,
  time: string
): Promise<string | null> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    // Parse "7:10 PM" or "19:10" format → 24h hours/minutes
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (period) {
      if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12;
      if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
    }

    // pakai trigger daily yang kompatibel SDK54 + fallback channel
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pengingat Habit',
        body: `Jangan lupa: ${habitTitle}`,
        data: { habitId },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH as any,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY as any,
        hour: hours,
        minute: minutes,
        repeats: true,
        channelId: 'reminders',
      } as any,
    });

    return id;
  } catch {
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
