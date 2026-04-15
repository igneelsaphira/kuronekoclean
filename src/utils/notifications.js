import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export const REMINDER_PRESETS = {
  morning: { id: 'morning', label: 'Manana', hour: 10, minute: 0 },
  afternoon: { id: 'afternoon', label: 'Tarde', hour: 15, minute: 30 },
  evening: { id: 'evening', label: 'Noche', hour: 20, minute: 30 },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function prepareNotifications() {
  if (Platform.OS === 'web' || !Device.isDevice) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminders', {
      name: 'Daily reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  return true;
}

export async function requestReminderPermission() {
  if (Platform.OS === 'web' || !Device.isDevice) return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function clearReminderNotifications() {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleDailyReminder(slotId = 'evening') {
  if (Platform.OS === 'web' || !Device.isDevice) return false;

  const preset = REMINDER_PRESETS[slotId] || REMINDER_PRESETS.evening;
  await clearReminderNotifications();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Kuroneko te espera',
      body: 'Una tarea pequena tambien cuenta hoy. Vamos suave.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: preset.hour,
      minute: preset.minute,
      channelId: 'daily-reminders',
    },
  });

  return true;
}
