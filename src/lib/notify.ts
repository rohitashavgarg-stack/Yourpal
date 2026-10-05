import { Platform } from 'react-native';

// Local notifications for the "Still training?" nudge. Not available on web, and every call is
// wrapped so a missing permission or module never affects the app.
const ID = 'still-training';
const CHANNEL = 'checkin';

async function mod() {
  if (Platform.OS === 'web') return null;
  try { return await import('expo-notifications'); } catch { return null; }
}

export async function scheduleStillTraining(atMs: number) {
  try {
    const N = await mod();
    if (!N || atMs <= Date.now() + 1000) return;
    N.setNotificationHandler({
      // The in-app prompt already shows while the app is open, so stay quiet in the foreground.
      handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: false, shouldShowList: false }),
    });
    if (Platform.OS === 'android') await N.setNotificationChannelAsync(CHANNEL, { name: 'Check-in', importance: N.AndroidImportance.HIGH });
    let st = await N.getPermissionsAsync();
    if (!st.granted) st = await N.requestPermissionsAsync();
    if (!st.granted) return;
    await N.cancelScheduledNotificationAsync(ID).catch(() => {});
    await N.scheduleNotificationAsync({
      identifier: ID,
      content: { title: 'Still training?', body: "We'll check you out in 10 min. Open YourPal to keep going.", ...(Platform.OS === 'android' ? { channelId: CHANNEL } : {}) } as any,
      trigger: { type: N.SchedulableTriggerInputTypes.DATE, date: new Date(atMs), ...(Platform.OS === 'android' ? { channelId: CHANNEL } : {}) } as any,
    });
  } catch {}
}

export async function cancelStillTraining() {
  try {
    const N = await mod();
    await N?.cancelScheduledNotificationAsync(ID);
  } catch {}
}
