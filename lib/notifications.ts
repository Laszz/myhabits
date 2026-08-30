import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
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
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
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

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Waktunya belajar!',
        body: `Jangan lupa: ${habitTitle}`,
        data: { habitId },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        channelId: 'reminders',
      },
    });

    Alert.alert('Notif Debug', `Scheduled!\nID: ${id}\nTime: ${hours}:${String(minutes).padStart(2, '0')}\nChannel: reminders`);
    return id;
  } catch (e: any) {
    Alert.alert('Notif Error', e?.message || String(e));
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
